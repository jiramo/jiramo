package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Project struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"`
	Title       string    `json:"title"`
	Description string    `json:"description"`

	CustomerID uuid.UUID `json:"customer_id" gorm:"type:uuid;not null;index"`
	Customer   User      `gorm:"foreignKey:CustomerID;references:ID"`
	Status     bool      `json:"status" gorm:"not null;default:0"`
}

func (u *Project) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return nil
}
