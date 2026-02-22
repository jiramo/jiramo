package middleware

import (
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"
)

func AppState(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		// Allow access to setup status and static resources
		if path == "/setup/status" || path == "/" || !isAPIPath(path) {
			next.ServeHTTP(w, r)
			return
		}

		switch models.AppState {

		case models.NoDB:
			if path != "/setup/db" {
				utils.WriteError(w, http.StatusForbidden, "database not configured")
				return
			}

		case models.NoAdmin:
			if path != "/setup/admin" {
				utils.WriteError(w, http.StatusForbidden, "admin not configured")
				return
			}

		case models.Ready:
			if path == "/setup/db" || path == "/setup/admin" {
				utils.WriteError(w, http.StatusForbidden, "setup already completed")
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

func isAPIPath(path string) bool {
	if len(path) < 5 {
		return false
	}
	return (len(path) >= 5 && path[:5] == "/auth") ||
		(len(path) >= 6 && path[:6] == "/users") ||
		(len(path) >= 6 && path[:6] == "/setup") ||
		(len(path) >= 8 && path[:8] == "/profile") ||
		(len(path) >= 9 && path[:9] == "/projects")
}
