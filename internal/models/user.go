package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name         string    `json:"name"`
	Surname      string    `json:"surname"`
	Email        string    `json:"email" gorm:"unique"`
	PasswordHash string    `json:"-"`
	Role         UserRole  `json:"role" gorm:"type:varchar(10);default:'user';check:role IN ('user','admin')" validate:"oneof=user admin"`

	Projects []Project `gorm:"foreignKey:CustomerID"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return nil
}
