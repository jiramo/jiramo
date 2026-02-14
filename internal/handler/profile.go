package handler

import (
	"encoding/json"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProfileHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewProfileHandler(db *gorm.DB) *ProfileHandler {
	return &ProfileHandler{
		DB:       db,
		Validate: validator.New(),
	}
}

type UpdateProfileInput struct {
	Name    string `json:"name" validate:"omitempty,min=2"`
	Surname string `json:"surname" validate:"omitempty,min=2"`
	Email   string `json:"email" validate:"omitempty,email"`
}

type ChangePasswordInput struct {
	CurrentPassword string `json:"current_password" validate:"required"`
	NewPassword     string `json:"new_password" validate:"required,min=6"`
}

func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

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

	response := map[string]any{
		"ID":      user.ID,
		"name":    user.Name,
		"surname": user.Surname,
		"email":   user.Email,
		"role":    user.Role,
	}

	utils.WriteJSON(w, http.StatusOK, response)
}

func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(models.UserIDKey).(uuid.UUID)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "invalid user ID")
		return
	}

	var input UpdateProfileInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	if err := h.Validate.Struct(input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	if input.Email != "" && input.Email != user.Email {
		var existingUser models.User
		if err := h.DB.Where("email = ? AND id != ?", input.Email, userID).First(&existingUser).Error; err == nil {
			utils.WriteError(w, http.StatusConflict, "email already in use")
			return
		}
	}

	updates := make(map[string]any)
	if input.Name != "" {
		updates["name"] = input.Name
	}
	if input.Surname != "" {
		updates["surname"] = input.Surname
	}
	if input.Email != "" {
		updates["email"] = input.Email
	}

	if len(updates) == 0 {
		utils.WriteError(w, http.StatusBadRequest, "no fields to update")
		return
	}

	if err := h.DB.Model(&user).Updates(updates).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to retrieve updated profile")
		return
	}

	response := map[string]any{
		"id":      user.ID,
		"name":    user.Name,
		"surname": user.Surname,
		"email":   user.Email,
		"role":    user.Role,
		"message": "profile updated successfully",
	}

	utils.WriteJSON(w, http.StatusOK, response)
}

func (h *ProfileHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(models.UserIDKey).(uuid.UUID)
	if !ok {
		utils.WriteError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var input ChangePasswordInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid JSON")
		return
	}

	if err := h.Validate.Struct(input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
	}

	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		utils.WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	if !utils.CheckPasswordHash(input.CurrentPassword, user.PasswordHash) {
		utils.WriteError(w, http.StatusUnauthorized, "current password is incorrect")
		return
	}

	hashedPassword, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	if err := h.DB.Model(&models.User{}).Where("id = ?", userID).Update("password_hash", hashedPassword).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to update password")
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "password changed successfully",
	})
}

func (h *ProfileHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

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

	//last admin account should not be deleted
	if user.Role == models.RoleAdmin {
		var adminCount int64
		if err := h.DB.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount).Error; err != nil {
			utils.WriteError(w, http.StatusInternalServerError, "failed to check admin count")
			return
		}

		if adminCount <= 1 {
			utils.WriteError(w, http.StatusForbidden, "cannot delete the last admin account")
			return
		}
	}

	if err := h.DB.Delete(&user).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to delete account")
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "account deleted successfully",
	})
}
