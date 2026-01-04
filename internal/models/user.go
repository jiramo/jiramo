package models

import (
	"time"
)

const (
	RoleUser         = "user"
	RoleCollaborator = "collaborator"
	RoleAdmin        = "admin"
)

type User struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Email         string         `gorm:"uniqueIndex;not null" json:"email"`
	Password      string         `json:"-"`                        // Nasconde la password nella risposta
	Role          string         `gorm:"default:user" json:"role"` // Qui usiamo string, e le costanti sopra aiutano
	CreatedAt     time.Time      `json:"created_at"`
	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID"`
}

// RefreshToken model per la gestione stateful e rotazione
type RefreshToken struct {
	ID          uint      `gorm:"primaryKey"`
	UserID      uint      `gorm:"index"`
	TokenHash   string    `gorm:"index;not null"` // Hash del token opaco
	Fingerprint string    `gorm:"not null"`       // Hash di (IP + UserAgent)
	ExpiresAt   time.Time `gorm:"not null"`
	Revoked     bool      `gorm:"default:false"` // Se true, il token è bruciato
	CreatedAt   time.Time
	// FamilyID viene usato per tracciare la catena di rotazione
	FamilyID string `gorm:"index"`
}

// registration payload
type RegisterInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

// login payload
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}
