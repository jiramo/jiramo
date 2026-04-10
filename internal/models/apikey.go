package models

import (
	"github.com/google/uuid"
	"time"
)

type APIKey struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID uuid.UUID  `json:"project_id" gorm:"type:uuid;not null;index"`
	Project   Project    `json:"-" gorm:"foreignKey:ProjectID;references:ID;constraint:OnDelete:CASCADE"`
	Key       string     `json:"key" gorm:"not null;uniqueIndex"`
	Label     string     `json:"label"`
	TrustMode bool       `json:"trust_mode" gorm:"not null;default:false"`
	CreatedAt time.Time  `json:"created_at"`
	ExpiresAt *time.Time `json:"expires_at,omitempty"`
}
