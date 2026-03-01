package handler

import (
	"encoding/json"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"
	"strconv"

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

type UpdateProjectInput struct {
	Title       *string `json:"title" validate:"omitempty,min=3,max=32"`
	Description *string `json:"description" validate:"omitempty,min=1.max=64"`
	CustomerId  *string `json:"customer_id" validate:"omitempty,uuid"`
}

func (h *ProjectHandler) GetProjects(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page := 1
	limit := 10

	if pageStr != "" {
		p, err := strconv.Atoi(pageStr)
		if err != nil || p <= 0 {
			utils.WriteError(w, http.StatusBadRequest, "Invalid 'page' parameter")
			return
		}
		page = p
	}

	if limitStr != "" {
		l, err := strconv.Atoi(limitStr)
		if err != nil || l <= 0 {
			utils.WriteError(w, http.StatusBadRequest, "Invalid 'limit' parameter")
			return
		}
		limit = l
	}

	offset := (page - 1) * limit

	var projects []models.Project
	if err := h.DB.Limit(limit).Offset(offset).Find(&projects).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Failed to retrieve projects")
		return
	}

	utils.WriteJSON(w, http.StatusOK, projects)
}

func (h *ProjectHandler) CreateProject(w http.ResponseWriter, r *http.Request) {
	var input ProjectInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	customerUUID, success := h.validateCustomer(w, input.CustomerId)
	if !success {
		return
	}

	project := models.Project{
		ID:          uuid.New(),
		Title:       input.Title,
		Description: input.Description,
		CustomerID:  customerUUID,
		Status:      false,
	}

	if err := h.DB.Create(&project).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Error during creation")
		return
	}

	if err := h.DB.Preload("Customer").First(&project, project.ID).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Error loading project")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, project)
}

func (h *ProjectHandler) EditProject(w http.ResponseWriter, r *http.Request) {
	var input UpdateProjectInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := h.Validate.Struct(input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	vars := mux.Vars(r)
	idStr := vars["id"]

	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "Invalid id", http.StatusBadRequest)
		return
	}

	var project models.Project
	if err := h.DB.First(&project, "id = ?", id).Error; err != nil {
		utils.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}

	updates := map[string]interface{}{}

	if input.Title != nil {
		updates["title"] = *input.Title
	}
	if input.Description != nil {
		updates["description"] = *input.Description
	}
	if input.CustomerId != nil {
		customerUUID, success := h.validateCustomer(w, *input.CustomerId)
		if !success {
			return
		}
		updates["customer_id"] = customerUUID
	}

	if len(updates) == 0 {
		utils.WriteError(w, http.StatusBadRequest, "No fields to update")
		return
	}

	if err := h.DB.Model(&project).Updates(updates).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Error during update")
		return
	}

	var updated models.Project
	h.DB.Preload("Customer").First(&updated, "id = ?", id)
	utils.WriteJSON(w, http.StatusOK, updated)
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
	if err := h.DB.Preload("Customer").First(&project, id).Error; err != nil {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	}

	resp := map[string]any{
		"status": project.Status,
		"customer": map[string]string{
			"name":    project.Customer.Name,
			"surname": project.Customer.Surname,
			"email":   project.Customer.Email,
		},
	}

	utils.WriteJSON(w, http.StatusOK, resp)
}

func (h *ProjectHandler) validateCustomer(w http.ResponseWriter, customerIdStr string) (uuid.UUID, bool) {
	customerUUID, err := uuid.Parse(customerIdStr)
	if err != nil {
		http.Error(w, "Invalid CustomerId", http.StatusBadRequest)
		return uuid.Nil, false
	}

	var count int64
	if err := h.DB.Model(&models.User{}).Where("id = ?", customerUUID).Count(&count).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "Database error")
		return uuid.Nil, false
	}

	if count == 0 {
		utils.WriteError(w, http.StatusNotFound, "Customer not found")
		return uuid.Nil, false
	}

	return customerUUID, true
}
