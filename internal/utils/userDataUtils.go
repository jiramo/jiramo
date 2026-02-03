package utils

import (
	"jiramo/internal/middleware"
	"jiramo/internal/models"
	"net/http"
)

// GetUserID, GetUserRole, for now unused but could be useful later
func GetUserID(r *http.Request) (string, bool) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	return userID, ok
}

func GetUserRole(r *http.Request) (models.UserRole, bool) {
	role, ok := r.Context().Value(middleware.UserRoleKey).(models.UserRole)
	return role, ok
}
