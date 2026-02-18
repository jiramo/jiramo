package handler

import (
	"errors"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type HandlerBase interface {
	decodeAndValidate(*http.Request, any) error
	findUserByID(uuid.UUID) (*models.User, error)
}

type EmailCarrier interface {
	GetEmail() string
}

func validateUserUpdate(h HandlerBase, db *gorm.DB, r *http.Request, userID uuid.UUID, input EmailCarrier) (*models.User, error) {

	if err := h.decodeAndValidate(r, input); err != nil {
		return nil, err
	}

	user, err := h.findUserByID(userID)
	if err != nil {
		return nil, err
	}

	if input.GetEmail() != "" {
		if err := utils.CheckEmailUnique(db, input.GetEmail(), userID); err != nil {
			return nil, err
		}
	}

	return user, nil
}

func prepareUserDeletion(findUser func(uuid.UUID) (*models.User, error), db *gorm.DB, userID uuid.UUID) (*models.User, error) {
	user, err := findUser(userID)
	if err != nil {
		return nil, err
	}

	isLastAdmin, err := utils.CheckLastAdmin(db, user)
	if err != nil {
		return nil, err
	}

	if isLastAdmin {
		return nil, utils.ErrPermissionDenied
	}

	return user, nil
}

func writeHTTPError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		utils.WriteError(w, http.StatusNotFound, "user not found")
	case errors.Is(err, utils.ErrPermissionDenied):
		utils.WriteError(w, http.StatusForbidden, "cannot delete the last admin account")
	default:
		utils.WriteError(w, http.StatusInternalServerError, err.Error())
	}
}

func (u UpdateProfileInput) GetEmail() string {
	return u.Email
}

func (u UpdateUserInput) GetEmail() string {
	return u.Email
}
