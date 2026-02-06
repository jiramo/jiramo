package handler

import (
	"encoding/json"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		DB:       db,
		Validate: validator.New(),
	}
}

type RegisterInput struct {
	Name     string `json:"name" validate:"required,min=2"`
	Surname  string `json:"surname" validate:"required,min=2"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashed, err := utils.HashPassword(input.Password)
	if err != nil {
		http.Error(w, "Password hash error", http.StatusInternalServerError)
		return
	}

	user := models.User{
		ID:           uuid.New(),
		Name:         input.Name,
		Surname:      input.Surname,
		Email:        input.Email,
		PasswordHash: hashed,
		Role:         "user",
	}

	if err := h.DB.Create(&user).Error; err != nil {
		http.Error(w, "User creation error", http.StatusInternalServerError)
		return
	}

	resp := map[string]interface{}{
		"id":      user.ID,
		"name":    user.Name,
		"surname": user.Surname,
		"email":   user.Email,
		"role":    user.Role,
	}

	utils.WriteJSON(w, http.StatusCreated, resp)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user models.User
	if err := h.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		http.Error(w, "Incorrect password", http.StatusUnauthorized)
		return
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Role)
	if err != nil {
		http.Error(w, "Access token generation error", http.StatusInternalServerError)
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		http.Error(w, "Refresh token generation error", http.StatusInternalServerError)
		return
	}

	userToken := models.Token{
		ID:           uuid.New(),
		UserID:       user.ID,
		RefreshToken: refreshToken,
		ExpiresAt:    time.Now().Add(utils.RefreshTokenExpiry),
	}

	if err := h.DB.Create(&userToken).Error; err != nil {
		http.Error(w, "Could not save refresh token", http.StatusInternalServerError)
		return
	}

	resp := map[string]string{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
	}

	utils.WriteJSON(w, http.StatusOK, resp)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		utils.WriteError(w, http.StatusUnauthorized, "refresh token missing")
		return
	}

	refreshToken := cookie.Value

	var token models.Token
	err = h.DB.
		Preload("User").
		Where("refresh_token = ?", refreshToken).
		First(&token).Error

	if err != nil {
		utils.WriteError(w, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	if time.Now().After(token.ExpiresAt) {
		_ = h.DB.Delete(&token)
		utils.WriteError(w, http.StatusUnauthorized, "refresh token expired")
		return
	}

	accessToken, err := utils.GenerateAccessToken(token.User.ID, token.User.Role)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "could not generate access token")
		return
	}

	newRefreshToken := uuid.NewString()
	newExpiry := time.Now().Add(30 * 24 * time.Hour)

	token.RefreshToken = newRefreshToken
	token.ExpiresAt = newExpiry

	if err := h.DB.Model(&models.Token{}).
		Where("id = ?", token.ID).
		Updates(map[string]interface{}{
			"refresh_token": newRefreshToken,
			"expires_at":    newExpiry,
		}).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "could not rotate refresh token")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/auth/refresh",
		Expires:  newExpiry,
	})

	utils.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"access_token": accessToken,
		"expires_in":   300, // 5 minutes
	})
}
