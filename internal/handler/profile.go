package handler

import (
	"encoding/json"
	"errors"
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
	user, err := h.getCurrentUser(r)
	if err != nil {
		utils.WriteError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	utils.WriteJSON(w, http.StatusOK, user)
}

func (h *ProfileHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserID(r)
	if err != nil {
		utils.WriteError(w, http.StatusUnauthorized, "invalid user ID")
		return
	}

	var input UpdateProfileInput
	user, err := validateUserUpdate(h, h.DB, r, userID, &input)

	if err != nil {
		status := http.StatusBadRequest

		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, utils.ErrEmailAlreadyUsed) {
			status = http.StatusConflict
		}

		utils.WriteError(w, status, err.Error())
		return
	}

	updates := utils.BuildUpdateMap(map[string]interface{}{
		"name":    input.Name,
		"surname": input.Surname,
		"email":   input.Email,
	})

	if len(updates) == 0 {
		utils.WriteError(w, http.StatusBadRequest, "no fields to update")
		return
	}

	if err := h.updateUser(user, updates); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to update profile")
		return
	}

	updatedUser, err := h.findUserByID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to retrieve updated profile")
		return
	}

	utils.WriteJSON(w, http.StatusOK, updatedUser)
}

func (h *ProfileHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserID(r)
	if err != nil {
		utils.WriteError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	var input ChangePasswordInput
	if err := h.decodeAndValidate(r, &input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	user, err := h.findUserByID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	if err := utils.VerifyPassword(input.CurrentPassword, user.PasswordHash); err != nil {
		utils.WriteError(w, http.StatusUnauthorized, "current password is incorrect")
		return
	}

	hashedPassword, err := utils.HashPasswordSafe(input.NewPassword)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	if err := h.updatePassword(userID, hashedPassword); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to update password")
		return
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "password updated successfully",
	})
}

func (h *ProfileHandler) DeleteProfile(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getUserID(r)
	if err != nil {
		utils.WriteError(w, http.StatusUnauthorized, "user not authenticated")
		return
	}

	user, err := h.findUserByID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	isLastAdmin, err := utils.CheckLastAdmin(h.DB, user)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to check admin count")
		return
	}

	if isLastAdmin {
		utils.WriteError(w, http.StatusForbidden, "cannot delete the last admin account")
		return
	}

	if err := h.deleteUser(user); err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to delete account")
		return
	}

	utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (h *ProfileHandler) getUserID(r *http.Request) (uuid.UUID, error) {
	userID, ok := r.Context().Value(models.UserIDKey).(uuid.UUID)
	if !ok {
		return uuid.Nil, errors.New("invalid user ID in context")
	}
	return userID, nil
}

func (h *ProfileHandler) getCurrentUser(r *http.Request) (*models.User, error) {
	userID, err := h.getUserID(r)
	if err != nil {
		return nil, err
	}
	return h.findUserByID(userID)
}

func (h *ProfileHandler) findUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (h *ProfileHandler) decodeAndValidate(r *http.Request, input interface{}) error {
	if err := json.NewDecoder(r.Body).Decode(input); err != nil {
		return errors.New("invalid JSON")
	}
	if err := h.Validate.Struct(input); err != nil {
		return err
	}
	return nil
}

func (h *ProfileHandler) updateUser(user *models.User, updates map[string]interface{}) error {
	return h.DB.Model(user).Updates(updates).Error
}

func (h *ProfileHandler) updatePassword(userID uuid.UUID, hashedPassword string) error {
	return h.DB.Model(&models.User{}).
		Where("id = ?", userID).
		Update("password_hash", hashedPassword).Error
}

func (h *ProfileHandler) deleteUser(user *models.User) error {
	return h.DB.Delete(user).Error
}
