package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string
type contextKey string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

const (
	UserIDKey   contextKey = "user_id"
	UserRoleKey contextKey = "user_role"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name         string    `json:"name"`
	Surname      string    `json:"surname"`
	Email        string    `json:"email" gorm:"unique"`
	PasswordHash string    `json:"-"`
	Role         UserRole  `json:"role" gorm:"type:varchar(10);default:'user';check:role IN ('user','admin')" validate:"oneof=user admin"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	u.ID = uuid.New()
	return nil
}
