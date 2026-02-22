package db

import (
	"fmt"
	"log"

	"jiramo/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(user, host, password, name, port string) (*gorm.DB, error) {
	// First check and create the database if it does not exist
	if err := ensureDatabaseExists(user, host, password, name, port); err != nil {
		log.Printf("Warning: could not create database: %v", err)
	}

	// Build DSN with or without a password
	var dsn string
	if password == "" {
		dsn = fmt.Sprintf(
			"host=%s user=%s dbname=%s port=%s sslmode=disable",
			host, user, name, port,
		)
	} else {
		dsn = fmt.Sprintf(
			"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			host, user, password, name, port,
		)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		models.AppState = models.NoDB
		return nil, err
	}

	log.Println("Database connected successfully")

	log.Println("Running migrations...")
	if err := db.AutoMigrate(
		&models.User{},
		&models.Project{},
		&models.Token{},
	); err != nil {
		models.AppState = models.NoDB
		return nil, err
	}

	adminExists, err := AdminExists(db)
	if err != nil {
		models.AppState = models.NoDB
		return nil, err
	}

	if adminExists {
		models.AppState = models.Ready
		log.Println("Application state: READY")
	} else {
		models.AppState = models.NoAdmin
		log.Println("Application state: NO ADMIN")
	}

	return db, nil
}
