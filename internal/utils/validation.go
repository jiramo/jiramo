package utils

import (
	"jiramo/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CheckEmailUnique(db *gorm.DB, email string, excludeUSERID uuid.UUID) error {
	var existingUser models.User
	if err := db.Where("email = ? AND id != ?", email, excludeUSERID).First(&existingUser).Error; err == nil {
		return gorm.ErrDuplicatedKey
	}
	return nil
}

func CheckLastAdmin(db *gorm.DB, user *models.User) (bool, error) {
	if user.Role != models.RoleAdmin {
		return false, nil
	}

	var adminCount int64
	if err := db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount).Error; err != nil {
		return false, err
	}

	return adminCount <= 1, nil
}

func BuildUpdateMap(fields map[string]any) map[string]any {
	updates := make(map[string]any)
	for key, value := range fields {
		switch v := value.(type) {
		case string:
			if v != "" {
				updates[key] = v
			}
		case models.UserRole:
			if v != "" {
				updates[key] = v
			}
		default:
			if v != nil {
				updates[key] = v
			}
		}
	}
	return updates
}
