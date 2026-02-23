package middleware

import (
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"
)

// AppState is a middleware that enforces application setup flow restrictions.
// It intercepts incoming HTTP requests and conditionally allows or blocks them
// depending on whether the database and admin user have been configured.
//
// Behavior:
//   - Always allows access to "/" and "/setup/status".
//   - If the application state is NoDB, only "/setup/db" is accessible.
//   - If the application state is NoAdmin, only "/setup/admin" is accessible.
//   - If the application state is Ready, setup endpoints ("/setup/db",
//     "/setup/admin") are blocked.
//
// For disallowed routes, it responds with HTTP 403 Forbidden and a descriptive
// error message. Otherwise, the request is passed to the next handler.
func AppState(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		if path == "/setup/status" || path == "/" {
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
