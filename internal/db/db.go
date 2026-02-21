package db

import (
	"fmt"
	"log"

	"jiramo/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(user, host, password, name, port string) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host,
		user,
		password,
		name,
		port,
	)

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
