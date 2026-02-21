package db

import (
	"jiramo/internal/config"
	"jiramo/internal/models"

	"gorm.io/gorm"
)

func AdminExists(db *gorm.DB) (bool, error) {
	if db == nil {
		return false, gorm.ErrInvalidDB
	}

	var count int64
	err := db.
		Model(&models.User{}).
		Where("role = ?", "admin").
		Count(&count).
		Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func ConnectFromEnv() (*gorm.DB, error) {
	return Connect(
		config.Global.DB_USER,
		config.Global.DB_HOST,
		config.Global.DB_PASSWORD,
		config.Global.DB_NAME,
		config.Global.DB_PORT,
	)
}
