package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"jiramo/internal/models"
	"jiramo/internal/types"
	"jiramo/internal/utils"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{DB: db, Validate: validator.New()}
}

// REGISTER
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input models.RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	hashedPwd, _ := utils.HashPassword(input.Password)
	user := models.User{Email: input.Email, Password: hashedPwd, Role: models.RoleUser}

	if result := h.DB.Create(&user); result.Error != nil {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created"})
}

// PROFILE
func (h *AuthHandler) Profile(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(types.UserKey).(*utils.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id": claims.UserID,
		"role":    claims.Role,
	})
}

// ADMIN DASHBOARD
func (h *AuthHandler) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]string{"message": "Welcome Admin"})
}

// LOGIN
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input models.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid Request", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := h.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if !utils.CheckPassword(input.Password, user.Password) {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Access token
	accessToken, _ := utils.GenerateJWTAccessToken(user.ID, user.Role)

	// Refresh token
	rawRefreshToken, _ := utils.GenerateOpaqueToken()
	refreshTokenHash := utils.HashToken(rawRefreshToken)
	fingerprint := utils.GenerateFingerprint(r)
	familyID := uuid.New().String()

	newRefresh := models.RefreshToken{
		UserID:      user.ID,
		TokenHash:   refreshTokenHash,
		Fingerprint: fingerprint,
		ExpiresAt:   time.Now().Add(7 * 24 * time.Hour),
		FamilyID:    familyID,
	}
	h.DB.Create(&newRefresh)

	// Cookie HttpOnly
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    rawRefreshToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/auth/refresh",
		Expires:  newRefresh.ExpiresAt,
	})

	json.NewEncoder(w).Encode(map[string]string{
		"access_token": accessToken,
		"expires_in":   "900",
	})
}

// REFRESH HANDLER HTTP
func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	newAccess, err := h.RefreshInternal(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"access_token": newAccess,
	})
}

// REFRESH INTERNAL (publica per middleware)
func (h *AuthHandler) RefreshInternal(w http.ResponseWriter, r *http.Request) (string, error) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		return "", errors.New("missing refresh token")
	}

	rawToken := cookie.Value
	tokenHash := utils.HashToken(rawToken)
	fingerprint := utils.GenerateFingerprint(r)

	var storedToken models.RefreshToken
	if err := h.DB.Where("token_hash = ?", tokenHash).First(&storedToken).Error; err != nil {
		return "", errors.New("invalid token")
	}

	// Reuse detection
	if storedToken.Revoked {
		h.DB.Model(&models.RefreshToken{}).Where("family_id = ?", storedToken.FamilyID).Update("revoked", true)
		return "", errors.New("token reused; session terminated")
	}

	// Fingerprint check
	if storedToken.Fingerprint != fingerprint {
		return "", errors.New("session invalid: environment changed")
	}

	// Expiration check
	if time.Now().After(storedToken.ExpiresAt) {
		return "", errors.New("token expired")
	}

	// Token rotation
	h.DB.Model(&storedToken).Update("revoked", true)

	newRawToken, _ := utils.GenerateOpaqueToken()
	newHash := utils.HashToken(newRawToken)

	newRefresh := models.RefreshToken{
		UserID:      storedToken.UserID,
		TokenHash:   newHash,
		Fingerprint: fingerprint,
		ExpiresAt:   time.Now().Add(7 * 24 * time.Hour),
		FamilyID:    storedToken.FamilyID,
	}
	h.DB.Create(&newRefresh)

	var user models.User
	h.DB.First(&user, storedToken.UserID)
	newAccess, _ := utils.GenerateJWTAccessToken(user.ID, user.Role)

	// Aggiorna cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    newRawToken,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Path:     "/auth/refresh",
		Expires:  newRefresh.ExpiresAt,
	})

	return newAccess, nil
}

// LOGOUT
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")
	if err == nil {
		tokenHash := utils.HashToken(cookie.Value)
		h.DB.Model(&models.RefreshToken{}).Where("token_hash = ?", tokenHash).Update("revoked", true)
	}

	// Cancella cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		Path:     "/auth/refresh",
		MaxAge:   -1,
	})

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Logged out"))
}
