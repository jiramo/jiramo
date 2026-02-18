package handler

import (
	"encoding/json"
	"errors"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

type UpdateUserInput struct {
	Name    string          `json:"name" validate:"omitempty,min=2"`
	Surname string          `json:"surname" validate:"omitempty,min=2"`
	Email   string          `json:"email" validate:"omitempty,email"`
	Role    models.UserRole `json:"role" validate:"omitempty,oneof=user admin"`
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

	user, err := h.findUserByID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	utils.WriteJSON(w, http.StatusOK, user)
}

func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	page, limit, err := h.parsePagination(r)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	users, total, err := h.getUsersWithPagination(page, limit)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to retrieve users")
		return
	}

	resp := map[string]interface{}{
		"users": users,
		"pagination": map[string]interface{}{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	}

	utils.WriteJSON(w, http.StatusOK, resp)
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	type CreateUserInput struct {
		Name     string          `json:"name" validate:"required,min=2"`
		Surname  string          `json:"surname" validate:"required,min=2"`
		Email    string          `json:"email" validate:"required,email"`
		Password string          `json:"password" validate:"required,min=6"`
		Role     models.UserRole `json:"role" validate:"required,oneof=user admin"`
	}

	var input CreateUserInput
	if err := h.decodeAndValidate(r, &input); err != nil {
		utils.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := utils.CheckEmailUnique(h.DB, input.Email, uuid.Nil); err != nil {
		utils.WriteError(w, http.StatusConflict, "email already exists")
		return
	}

	hashedPassword, err := utils.HashPasswordSafe(input.Password)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	user := models.User{
		ID:           uuid.New(),
		Name:         input.Name,
		Surname:      input.Surname,
		Email:        input.Email,
		PasswordHash: hashedPassword,
		Role:         input.Role,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	utils.WriteJSON(w, http.StatusCreated, user)
}

func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	userID, err := h.parseUserIDFromURL(r)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid user ID")
		return
	}

	user, err := h.findUserByID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusNotFound, "user not found")
		return
	}

	utils.WriteJSON(w, http.StatusOK, user)
}

func (h *UserHandler) UpdateUserByID(w http.ResponseWriter, r *http.Request) {
	userID, err := h.parseUserIDFromURL(r)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid user ID")
		return
	}

	var input UpdateUserInput
	user, err := validateUserUpdate(h, h.DB, r, userID, &input)

	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		} else if errors.Is(err, gorm.ErrDuplicatedKey) {
			status = http.StatusConflict
		} else if errors.Is(err, utils.ErrEmailAlreadyUsed) {
			utils.WriteError(w, http.StatusConflict, err.Error())
			return
		}
		utils.WriteError(w, status, err.Error())
		return
	}

	updates := utils.BuildUpdateMap(map[string]any{
		"name":    input.Name,
		"surname": input.Surname,
		"email":   input.Email,
		"role":    input.Role,
	})

	if len(updates) == 0 {
		utils.WriteError(w, http.StatusBadRequest, "no fields to update")
		return
	}

	if err := h.DB.Model(user).Updates(updates).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to update user")
		return
	}

	updatedUser, err := h.findUserByID(userID)
	if err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to retrieve updated user")
		return
	}

	utils.WriteJSON(w, http.StatusOK, updatedUser)
}

func (h *UserHandler) DeleteUserByID(w http.ResponseWriter, r *http.Request) {
	userID, err := h.parseUserIDFromURL(r)
	if err != nil {
		utils.WriteError(w, http.StatusBadRequest, "invalid user ID")
		return
	}

	user, err := prepareUserDeletion(h.findUserByID, h.DB, userID)
	if err != nil {
		writeHTTPError(w, err)
		return
	}

	if err := h.DB.Delete(user).Error; err != nil {
		utils.WriteError(w, http.StatusInternalServerError, "failed to delete user")
		return
	}

	utils.WriteJSON(w, http.StatusNoContent, nil)
}

func (h *UserHandler) findUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	if err := h.DB.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (h *UserHandler) parseUserIDFromURL(r *http.Request) (uuid.UUID, error) {
	vars := mux.Vars(r)
	return uuid.Parse(vars["id"])
}

func (h *UserHandler) parsePagination(r *http.Request) (page, limit int, err error) {
	page = 1
	limit = 10

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		p, e := strconv.Atoi(pageStr)
		if e != nil || p <= 0 {
			return 0, 0, gorm.ErrInvalidValue
		}
		page = p
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		l, e := strconv.Atoi(limitStr)
		if e != nil || l <= 0 {
			return 0, 0, gorm.ErrInvalidValue
		}
		limit = l
	}

	return page, limit, nil
}

func (h *UserHandler) getUsersWithPagination(page, limit int) ([]models.User, int64, error) {
	offset := (page - 1) * limit
	var users []models.User
	var total int64

	if err := h.DB.Model(&models.User{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := h.DB.Limit(limit).Offset(offset).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (h *UserHandler) decodeAndValidate(r *http.Request, input interface{}) error {
	if err := json.NewDecoder(r.Body).Decode(input); err != nil {
		return err
	}
	return h.Validate.Struct(input)
}
