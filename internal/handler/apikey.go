package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"jiramo/internal/models"
	"jiramo/internal/utils"
)

type APIKeyHandler struct {
	DB *gorm.DB
}

func NewAPIKeyHandler(db *gorm.DB) *APIKeyHandler {
	return &APIKeyHandler{DB: db}
}

type CreateAPIKeyInput struct {
	Label     string     `json:"label"`
	TrustMode bool       `json:"trust_mode"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}

func (h *APIKeyHandler) Create(w http.ResponseWriter, r *http.Request) {
	projectID, err := uuid.Parse(mux.Vars(r)["id"])
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid project id")
		return
	}

	var input CreateAPIKeyInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		input = CreateAPIKeyInput{}
	}

	plainKey := uuid.NewString()

	hashed, err := bcrypt.GenerateFromPassword([]byte(plainKey), bcrypt.DefaultCost)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to hash api key")
		return
	}

	apiKey := models.APIKey{
		ID:        uuid.New(),
		ProjectID: projectID,
		Key:       string(hashed),
		Label:     input.Label,
		TrustMode: input.TrustMode,
		ExpiresAt: input.ExpiresAt,
		CreatedAt: time.Now(),
	}

	if err := h.DB.Create(&apiKey).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to save api key")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"id":         apiKey.ID.String(),
		"key":        plainKey,
		"label":      apiKey.Label,
		"trust_mode": apiKey.TrustMode,
		"expires_at": apiKey.ExpiresAt,
		"created_at": apiKey.CreatedAt,
	})
}

func (h *APIKeyHandler) List(w http.ResponseWriter, r *http.Request) {
	projectID, err := uuid.Parse(mux.Vars(r)["id"])
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid project id")
		return
	}

	var keys []models.APIKey
	if err := h.DB.Where("project_id = ?", projectID).Find(&keys).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to retrieve api keys")
		return
	}

	utils.WriteJSON(w, http.StatusOK, keys)
}

func (h *APIKeyHandler) Delete(w http.ResponseWriter, r *http.Request) {
	keyID, err := uuid.Parse(mux.Vars(r)["keyId"])
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid key id")
		return
	}

	result := h.DB.Delete(&models.APIKey{}, "id = ?", keyID)
	if result.Error != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to delete api key")
		return
	}
	if result.RowsAffected == 0 {
		utils.WriteError(w, http.StatusNotFound, "api key not found")
		return
	}

	utils.WriteJSON(w, http.StatusNoContent, nil)
}
