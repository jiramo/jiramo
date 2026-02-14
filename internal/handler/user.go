package handler

import (
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		DB:       db,
		Validate: validator.New(),
	}
}

func (h *UserHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(models.UserIDKey).(uuid.UUID)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	utils.WriteJSON(w, http.StatusOK, user)
}
