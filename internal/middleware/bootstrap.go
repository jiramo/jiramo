package middleware

import (
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"
)

func AppState(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

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
