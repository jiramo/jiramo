package handler

import (
	"encoding/json"
	"errors"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type AnalyticsHandler struct {
	DB *gorm.DB
}

func NewAnalyticsHandler(db *gorm.DB) *AnalyticsHandler {
	return &AnalyticsHandler{db}
}

type TrackPayload struct {
	ProjectID     string `json:"project_id"`
	URL           string `json:"url"`
	Referrer      string `json:"referrer"`
	Title         string `json:"title"`
	PrevPath      string `json:"prev_path"`
	PrevCreatedAt string `json:"prev_created_at"`
}

type EventPayload struct {
	ProjectID string `json:"project_id"`
	URL       string `json:"url"`
	EventName string `json:"event_name"`
	EventData string `json:"event_data"`
}

// POST /analytics/track
func (h *AnalyticsHandler) Track(w http.ResponseWriter, r *http.Request) {
	var payload TrackPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	projectID, err := uuid.Parse(payload.ProjectID)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid project_id")
		return
	}

	if err := h.DB.First(&models.Project{}, "id = ?", projectID).Error; err != nil {
		utils.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}

	parsedURL, err := url.Parse(payload.URL)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	visitorID := utils.VisitorFingerprint(r, payload.ProjectID)
	browser, os, device := utils.ParseUserAgent(r.UserAgent())
	utmSource, utmMedium, utmCampaign := utils.ParseUTM(r)

	lang := r.Header.Get("Accept-Language")
	if idx := strings.Index(lang, ","); idx != -1 {
		lang = lang[:idx]
	}

	var session models.Session
	sessionErr := h.DB.
		Where("visitor_id = ? AND project_id = ? AND expires_at > ?",
			visitorID, projectID, time.Now()).
		Order("expires_at DESC").
		First(&session).Error

	isNewSession := errors.Is(sessionErr, gorm.ErrRecordNotFound)

	if isNewSession {
		session = models.Session{
			ID:          uuid.New(),
			ProjectID:   projectID,
			VisitorID:   visitorID,
			SessionID:   utils.NewSessionID(visitorID),
			Hostname:    parsedURL.Hostname(),
			Browser:     browser,
			OS:          os,
			Device:      device,
			Language:    lang,
			Referrer:    payload.Referrer,
			UTMSource:   utmSource,
			UTMMedium:   utmMedium,
			UTMCampaign: utmCampaign,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
			ExpiresAt:   utils.SessionExpiresAt(),
		}

		if err := h.DB.Create(&session).Error; err != nil {
			utils.WriteError(w, http.StatusInternalServerError, "Could not create session")
			return
		}
	} else {
		h.DB.Model(&session).Updates(map[string]interface{}{
			"expires_at": utils.SessionExpiresAt(),
			"updated_at": time.Now(),
		})
	}

	if payload.PrevPath != "" && payload.PrevCreatedAt != "" {
		if prevTime, err := time.Parse(time.RFC3339, payload.PrevCreatedAt); err == nil {
			dur := int(time.Since(prevTime).Seconds())
			if dur > 0 && dur < 3600 {
				h.DB.Model(&models.PageView{}).
					Where("session_id = ? AND path = ? AND created_at >= ?",
						session.SessionID,
						payload.PrevPath,
						prevTime.Add(-2*time.Second)).
					Update("duration", dur)
			}
		}
	}

	view := models.PageView{
		ID:        uuid.New(),
		ProjectID: projectID,
		SessionID: session.SessionID,
		VisitorID: visitorID,
		URL:       payload.URL,
		Path:      parsedURL.Path,
		Referrer:  payload.Referrer,
		Title:     payload.Title,
		CreatedAt: time.Now(),
	}

	if err := h.DB.Create(&view).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Could not record page view")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"session_id":  session.SessionID,
		"view_id":     view.ID,
		"new_session": isNewSession,
	})
}

// POST /analytics/event
func (h *AnalyticsHandler) TrackEvent(w http.ResponseWriter, r *http.Request) {
	var payload EventPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid payload")
		return
	}

	projectID, err := uuid.Parse(payload.ProjectID)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid project_id")
		return
	}

	if strings.TrimSpace(payload.EventName) == "" {
		utils.WriteError(w, http.StatusBadRequest, "Invalid event name")
		return
	}

	parsedURL, err := url.Parse(payload.URL)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	visitorID := utils.VisitorFingerprint(r, payload.ProjectID)

	var session models.Session
	sessionErr := h.DB.
		Where("visitor_id = ? AND project_id = ? AND expires_at > ?",
			visitorID, projectID, time.Now()).
		Order("expires_at DESC").
		First(&session).Error

	sessionID := ""
	if errors.Is(sessionErr, gorm.ErrRecordNotFound) {
		sessionID = utils.NewSessionID(visitorID)
	} else {
		sessionID = session.SessionID
	}

	event := models.AnalyticsEvent{
		ID:        uuid.New(),
		ProjectID: projectID,
		SessionID: sessionID,
		VisitorID: visitorID,
		URL:       payload.URL,
		Path:      parsedURL.Path,
		EventName: payload.EventName,
		EventData: payload.EventData,
		CreatedAt: time.Now(),
	}

	if err := h.DB.Create(&event).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Could not record event")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, map[string]string{
		"event_id": event.ID.String(),
	})
}

// GET /projects/{id}/analytics
func (h *AnalyticsHandler) GetProjectStats(w http.ResponseWriter, r *http.Request) {
	projectID := mux.Vars(r)["id"]
	from, to := parseDateRange(r)

	var totalViews int64
	h.DB.Model(&models.PageView{}).
		Where("project_id = ? AND created_at BETWEEN ? AND ?", projectID, from, to).
		Count(&totalViews)

	var totalVisitors int64
	h.DB.Model(&models.PageView{}).
		Where("project_id = ? AND created_at BETWEEN ? AND ?", projectID, from, to).
		Distinct("visitor_id").
		Count(&totalVisitors)

	var totalSessions int64
	h.DB.Model(&models.Session{}).
		Where("project_id = ? AND created_at BETWEEN ? AND ?", projectID, from, to).
		Count(&totalSessions)

	var bounceSessions int64
	h.DB.Raw(`
		SELECT COUNT(*) FROM (
			SELECT session_id FROM page_views
			WHERE project_id = ? AND created_at BETWEEN ? AND ?
			GROUP BY session_id
			HAVING COUNT(*) = 1
		) sub`, projectID, from, to).Scan(&bounceSessions)

	bounceRate := 0.0
	if totalSessions > 0 {
		bounceRate = float64(bounceSessions) / float64(totalSessions) * 100
	}

	type eventStat struct {
		EventName string `json:"event_name"`
		Count     int64  `json:"count"`
	}

	var events []eventStat
	h.DB.Raw(`
		SELECT event_name, COUNT(*) AS count FROM analytics_events
		WHERE project_id = ? AND created_at BETWEEN ? AND ?
		GROUP BY event_name ORDER BY count DESC LIMIT 20`,
		projectID, from, to).Scan(&events)

	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"summary": map[string]interface{}{
			"visitors":    totalVisitors,
			"visits":      totalSessions,
			"views":       totalViews,
			"bounce_rate": bounceRate,
		},
		"events": events,
	})
}

// GET /projects/{id}/analytics/realtime
func (h *AnalyticsHandler) GetRealtimeStats(w http.ResponseWriter, r *http.Request) {
	projectID, err := uuid.Parse(mux.Vars(r)["id"])
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "Invalid project id")
		return
	}

	since := time.Now().Add(-5 * time.Minute)

	var activeVisitors int64
	h.DB.Model(&models.PageView{}).
		Where("project_id = ? AND created_at >= ?", projectID, since).
		Distinct("visitor_id").
		Count(&activeVisitors)

	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"active_visitors": activeVisitors,
		"as_of":           time.Now().Format(time.RFC3339),
	})
}

func parseDateRange(r *http.Request) (from, to time.Time) {
	to = time.Now()
	from = to.AddDate(0, 0, -30)

	layouts := []string{time.RFC3339, "2006-01-02"}

	if s := r.URL.Query().Get("from"); s != "" {
		for _, l := range layouts {
			if t, err := time.Parse(l, s); err == nil {
				from = t
				break
			}
		}
	}

	if s := r.URL.Query().Get("to"); s != "" {
		for _, l := range layouts {
			if t, err := time.Parse(l, s); err == nil {
				to = t.Add(24*time.Hour - time.Second)
				break
			}
		}
	}

	return
}
