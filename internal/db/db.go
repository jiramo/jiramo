package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"jiramo/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var db *gorm.DB
	var err error

	// Riprova 5 volte con attesa di 2 secondi
	counts := 0
	for {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("Database connected successfully!")
			break
		}

		log.Printf("Postgres not ready yet (count %d)... waiting 2 seconds. Error: %v\n", counts, err)
		counts++

		if counts > 5 {
			log.Fatal(err)
		}

		time.Sleep(2 * time.Second)
	}

	log.Println("Running migrations...")
	db.AutoMigrate(&models.User{}, &models.RefreshToken{})

	return db
}
