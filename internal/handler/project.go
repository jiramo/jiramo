package handler

import (
	"encoding/json"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type ProjectHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

func NewProjectHandler(db *gorm.DB) *ProjectHandler {
	return &ProjectHandler{DB: db, Validate: validator.New()}
}

type ProjectInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	CustomerId  string `json:"customer_id"`
}

func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input ProjectInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	project := models.Project{
		Title:       input.Title,
		Description: input.Description,
	}

	// string -> uuid.UUID
	customerUUID, err := uuid.Parse(input.CustomerId)
	if err != nil {
		http.Error(w, "Invalid CustomerId", http.StatusBadRequest)
		return
	}
	project.CustomerID = customerUUID

	if err := h.DB.Create(&project).Error; err != nil {
		// utils.WriteError(w, http.StatusInternalServerError, fmt.Sprintf("Errore creazione progetto: %v", err))
		utils.WriteError(w, http.StatusInternalServerError, "Error during creation")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, project)
}

func (h *ProjectHandler) ProjectStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid id", http.StatusBadRequest)
		return
	}

	var project models.Project
	if err := h.DB.First(&project, id).Error; err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	resp := map[string]bool{
		"status": project.Status,
	}

	utils.WriteJSON(w, http.StatusOK, resp)
}
