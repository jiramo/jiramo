package handler

import (
	"encoding/json"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{DB: db, Validate: validator.New()}
}

type RegisterInput struct {
	Name     string `json:"name"`
	Surname  string `json:"surname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input RegisterInput
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	hashed, err := utils.HashPassword(input.Password)
	if err != nil {
		http.Error(w, "Password hash error", http.StatusInternalServerError)
		return
	}

	user := models.User{
		Name:         input.Name,
		Surname:      input.Surname,
		Email:        input.Email,
		PasswordHash: hashed,
		Role:         "user",
	}

	result := h.DB.Create(&user)
	if result.Error != nil {
		http.Error(w, "User creation error", http.StatusInternalServerError)
		return
	}

	utils.WriteJSON(w, http.StatusCreated, user)
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

	var user models.User
	result := h.DB.Where("email = ?", input.Email).First(&user)
	if result.Error != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		http.Error(w, "Incorrect password", http.StatusUnauthorized)
		return
	}

	token, err := utils.GenerateJWT(user.ID.String(), user.Role)
	if err != nil {
		http.Error(w, "Token generation error", http.StatusInternalServerError)
		return
	}

	resp := map[string]string{
		"token": token,
	}

	utils.WriteJSON(w, http.StatusOK, resp)
}
