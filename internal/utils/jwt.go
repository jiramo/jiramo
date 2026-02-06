package utils

import (
	"jiramo/internal/config"
	"jiramo/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	AccessTokenExpiry  = 15 * time.Minute
	RefreshTokenExpiry = 7 * 24 * time.Hour
	Issuer             = "jiramo"
)

// GenerateAccessToken crea un JWT per l'access token (scadenza breve)
func GenerateAccessToken(userID uuid.UUID, role models.UserRole) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID.String(),
		"role": role,
		"iat":  time.Now().Unix(),
		"exp":  time.Now().Add(AccessTokenExpiry).Unix(),
		"iss":  Issuer,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Global.JWT_SECRET))
}

// GenerateRefreshToken crea un JWT per il refresh token (scadenza lunga)
func GenerateRefreshToken(userID uuid.UUID) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID.String(),
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(RefreshTokenExpiry).Unix(),
		"iss": Issuer,
		"jti": uuid.NewString(), // ID unico per revoca e tracciamento
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Global.JWT_SECRET))
}
