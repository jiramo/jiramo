package db

import (
	"fmt"
	"jiramo/internal/config"
	"jiramo/internal/models"

	"gorm.io/driver/postgres"
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

func ensureDatabaseExists(user, host, password, dbname, port string) error {
	var dsn string
	if password == "" {
		dsn = fmt.Sprintf(
			"host=%s user=%s dbname=postgres port=%s sslmode=disable",
			host, user, port,
		)
	} else {
		dsn = fmt.Sprintf(
			"host=%s user=%s password=%s dbname=postgres port=%s sslmode=disable",
			host, user, password, port,
		)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("cannot connect to postgres database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	defer sqlDB.Close()

	// Check if db exists
	var exists bool
	err = db.Raw("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ?)", dbname).Scan(&exists).Error
	if err != nil {
		return fmt.Errorf("error checking database existence: %w", err)
	}

	// If it doesn't exist, create it
	if !exists {
		err = db.Exec(fmt.Sprintf("CREATE DATABASE %s", dbname)).Error
		if err != nil {
			return fmt.Errorf("error creating database: %w", err)
		}
	}

	return nil
}
