package middleware

import (
	"context"
	"errors"
	"jiramo/internal/types"
	"jiramo/internal/utils"
	"net/http"
	"strings"
)

type RefreshFunc func(w http.ResponseWriter, r *http.Request) (string, error)

func Auth(refresh RefreshFunc) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Missing Authorization Header", http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := utils.ValidateToken(tokenString)

			if errors.Is(err, utils.ErrTokenExpired) {
				newAccess, err := refresh(w, r)
				if err != nil {
					http.Error(w, "Unauthorized", http.StatusUnauthorized)
					return
				}
				claims, err = utils.ValidateToken(newAccess)
				if err != nil {
					http.Error(w, "Unauthorized", http.StatusUnauthorized)
					return
				}
				w.Header().Set("X-New-Access-Token", newAccess)
			}

			if err != nil {
				http.Error(w, "Invalid Token", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), types.UserKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func SecureHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Prevenzione Sniffing MIME type
		w.Header().Set("X-Content-Type-Options", "nosniff")
		// Protezione XSS (Cross-site scripting)
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		// Prevenzione Clickjacking
		w.Header().Set("X-Frame-Options", "DENY")
		// HSTS (Forza HTTPS per 1 anno) - Essenziale in produzione
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		// Content Security Policy (Impedisce caricamento script esterni non autorizzati)
		w.Header().Set("Content-Security-Policy", "default-src 'self'")

		next.ServeHTTP(w, r)
	})
}
