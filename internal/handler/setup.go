package handler

import (
	"encoding/json"
	"jiramo/internal/config"
	"jiramo/internal/db"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"log"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type SetupHandler struct {
	DB          *gorm.DB
	Validate    *validator.Validate
	HandlerRefs *HandlerRegistry
}

type HandlerRegistry struct {
	Auth    *AuthHandler
	Project *ProjectHandler
	User    *UserHandler
	Profile *ProfileHandler
}

func NewSetupHandler(db *gorm.DB) *SetupHandler {
	return &SetupHandler{
		DB:          db,
		Validate:    validator.New(),
		HandlerRefs: &HandlerRegistry{},
	}
}

func (h *SetupHandler) SetHandlerRegistry(registry *HandlerRegistry) {
	h.HandlerRefs = registry
}

func (h *SetupHandler) Status(w http.ResponseWriter, r *http.Request) {
	var state string

	// If DB is not initialized, we're in no_db state
	if h.DB == nil {
		state = "no_db"
	} else {
		// DB exists, check if admin exists
		exists, err := db.AdminExists(h.DB)
		if err != nil || !exists {
			state = "no_admin"
		} else {
			state = "ready"
		}
	}

	// Update AppState to match actual DB state
	switch state {
	case "no_db":
		models.AppState = models.NoDB
	case "no_admin":
		models.AppState = models.NoAdmin
	case "ready":
		models.AppState = models.Ready
	}

	utils.WriteJSON(w, http.StatusOK, map[string]string{
		"state": state,
	})
}

type DBSetupRequest struct {
	User     string `json:"user" validate:"required"`
	Host     string `json:"host" validate:"required"`
	Password string `json:"password"` // Opzionale per trust mode
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

	dbConn, _ := db.Connect(
		req.User,
		req.Host,
		req.Password,
		req.Name,
		req.Port,
	)

	if dbConn == nil {
		http.Error(w, "database connection failed", http.StatusInternalServerError)
		return
	}

	h.DB = dbConn

	dbConfig := config.DBConfig{
		Host:     req.Host,
		User:     req.User,
		Password: req.Password,
		Name:     req.Name,
		Port:     req.Port,
	}
	if err := config.SaveDBConfig(dbConfig); err != nil {
		log.Printf("Warning: could not save DB config: %v", err)
	}

	if h.HandlerRefs.Auth != nil {
		h.HandlerRefs.Auth.DB = dbConn
	}
	if h.HandlerRefs.Project != nil {
		h.HandlerRefs.Project.DB = dbConn
	}
	if h.HandlerRefs.User != nil {
		h.HandlerRefs.User.DB = dbConn
	}
	if h.HandlerRefs.Profile != nil {
		h.HandlerRefs.Profile.DB = dbConn
	}

	// Check if admin exists (setup might have been done before)
	exists, errCheck := db.AdminExists(dbConn)
	if errCheck == nil && exists {
		models.AppState = models.Ready
	} else {
		models.AppState = models.NoAdmin
	}

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

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("{\"message\":\"admin created successfully\"}"))
}
