package models

import (
	"time"

	"github.com/google/uuid"
)

type Token struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null;index"`
	User         *User     `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	RefreshToken string    `json:"refresh_token" gorm:"not null;uniqueIndex"`
	ExpiresAt    time.Time `json:"expires_at" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
