package utils

import (
	"jiramo/internal/config"
	"jiramo/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GenerateJWT(userID string, role models.UserRole) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Global.JWT_SECRET))
}
