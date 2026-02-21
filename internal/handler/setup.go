package handler

import (
	"encoding/json"
	"jiramo/internal/db"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type SetupHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewSetupHandler(db *gorm.DB) *SetupHandler {
	return &SetupHandler{
		DB:       db,
		Validate: validator.New(),
	}
}

type DBSetupRequest struct {
	User     string `json:"user" validate:"required"`
	Host     string `json:"host" validate:"required"`
	Password string `json:"password" validate:"required"`
	Name     string `json:"name" validate:"required"`
	Port     string `json:"port" validate:"required"`
}

type AdminSetupRequest struct {
	Name     string `json:"name" validate:"required"`
	Surname  string `json:"surname" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

func (h *SetupHandler) DBSetup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req DBSetupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid json body", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	db, _ := db.Connect(
		req.User,
		req.Host,
		req.Password,
		req.Name,
		req.Port,
	)

	if db == nil {
		http.Error(w, "database connection failed", http.StatusInternalServerError)
		return
	}

	h.DB = db

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("database connected successfully"))
}

func (h *SetupHandler) AdminSetup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	if h.DB == nil {
		utils.WriteError(w, http.StatusServiceUnavailable, "database not initialized")
		return
	}

	exists, err := db.AdminExists(h.DB)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "database error")
		return
	}
	if exists {
		utils.WriteError(w, http.StatusConflict, "admin already exists")
		return
	}

	var req AdminSetupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid json body")
		return
	}

	if err := h.Validate.Struct(req); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(req.Password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "password hashing failed")
		return
	}

	admin := models.User{
		ID:           uuid.New(),
		Name:         req.Name,
		Surname:      req.Surname,
		Email:        req.Email,
		PasswordHash: string(hash),
		Role:         models.RoleAdmin,
	}

	if err := h.DB.Create(&admin).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "cannot create admin")
		return
	}

	models.AppState = models.Ready

	utils.WriteJSON(w, http.StatusCreated, map[string]string{
		"message": "admin created successfully",
	})
}
