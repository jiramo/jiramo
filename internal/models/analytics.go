package models

import (
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID   uuid.UUID `json:"project_id" gorm:"type:uuid;not null;index"`
	Project     Project   `json:"-" gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE"`
	VisitorID   string    `json:"visitor_id" gorm:"not null;index"`
	SessionID   string    `json:"session_id" gorm:"not null;uniqueIndex"`
	Hostname    string    `json:"hostname"`
	Browser     string    `json:"browser"`
	OS          string    `json:"os"`
	Device      string    `json:"device"`
	Country     string    `json:"country"`
	Language    string    `json:"language"`
	Referrer    string    `json:"referrer"`
	UTMSource   string    `json:"utm_source"`
	UTMMedium   string    `json:"utm_medium"`
	UTMCampaign string    `json:"utm_campaign"`
	CreatedAt   time.Time `json:"created_at" gorm:"index"`
	UpdatedAt   time.Time `json:"updated_at"`
	ExpiresAt   time.Time `json:"expires_at" gorm:"index"`
}

type PageView struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID uuid.UUID `json:"project_id" gorm:"type:uuid;not null;index"`
	Project   Project   `json:"-" gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE"`
	SessionID string    `json:"session_id" gorm:"not null;index"`
	VisitorID string    `json:"visitor_id" gorm:"not null;index"`
	URL       string    `json:"url"`
	Path      string    `json:"path"`
	Referrer  string    `json:"referrer"`
	Title     string    `json:"title"`
	Duration  int       `json:"duration" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at" gorm:"index"`
}

type AnalyticsEvent struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID uuid.UUID `json:"project_id" gorm:"type:uuid;not null;index"`
	Project   Project   `json:"-" gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE"`
	SessionID string    `json:"session_id" gorm:"not null;index"`
	VisitorID string    `json:"visitor_id" gorm:"not null"`
	URL       string    `json:"url" gorm:"not null"`
	Path      string    `json:"path" gorm:"not null"`
	EventName string    `json:"event_name" gorm:"not null;index"`
	EventData string    `json:"event_data" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at" gorm:"index"`
}
