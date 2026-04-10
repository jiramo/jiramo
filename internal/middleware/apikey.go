package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"jiramo/internal/models"
	"jiramo/internal/utils"
)

func APIKey(db *gorm.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			rawKey := extractAPIKey(r)
			if rawKey == "" {
				http.Error(w, `{"error":"missing api key"}`, http.StatusUnauthorized)
				return
			}

			projectID, err := uuid.Parse(mux.Vars(r)["id"])
			if err != nil {
				http.Error(w, `{"error":"invalid project id"}`, http.StatusBadRequest)
				return
			}

			var keys []models.APIKey
			if err := db.Where("project_id = ?", projectID).Find(&keys).Error; err != nil {
				http.Error(w, `{"error":"internal error"}`, http.StatusInternalServerError)
				return
			}

			var matched *models.APIKey
			for i := range keys {
				if bcrypt.CompareHashAndPassword([]byte(keys[i].Key), []byte(rawKey)) == nil {
					matched = &keys[i]
					break
				}
			}

			if matched == nil {
				http.Error(w, `{"error":"invalid api key"}`, http.StatusUnauthorized)
				return
			}

			if matched.ExpiresAt != nil && time.Now().After(*matched.ExpiresAt) {
				http.Error(w, `{"error":"api key expired"}`, http.StatusUnauthorized)
				return
			}

			if !matched.TrustMode {
				if !utils.DefaultRateLimiter.Allow(matched.ID.String()) {
					http.Error(w, `{"error":"rate limit exceeded"}`, http.StatusTooManyRequests)
					return
				}
			}

			ctx := context.WithValue(r.Context(), models.APIKeyProjectID, matched.ProjectID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func AuthOrAPIKey(db *gorm.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		jwtMiddleware := Auth(next)
		apiKeyMiddleware := APIKey(db)(next)

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if hasJWT(r) {
				jwtMiddleware.ServeHTTP(w, r)
				return
			}
			if hasAPIKey(r) {
				apiKeyMiddleware.ServeHTTP(w, r)
				return
			}
			http.Error(w, `{"error":"authentication required"}`, http.StatusUnauthorized)
		})
	}
}

func hasJWT(r *http.Request) bool {
	auth := r.Header.Get("Authorization")
	return strings.HasPrefix(auth, "Bearer ")
}

func hasAPIKey(r *http.Request) bool {
	return r.Header.Get("X-API-Key") != "" ||
		strings.HasPrefix(r.Header.Get("Authorization"), "ApiKey ")
}

func extractAPIKey(r *http.Request) string {
	if key := r.Header.Get("X-API-Key"); key != "" {
		return key
	}
	auth := r.Header.Get("Authorization")
	if strings.HasPrefix(auth, "ApiKey ") {
		return strings.TrimPrefix(auth, "ApiKey ")
	}
	return ""
}
