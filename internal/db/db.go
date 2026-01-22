package db

import (
	"fmt"
	"log"
	"time"

	"jiramo/internal/config"
	"jiramo/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		config.Global.DB_USER,
		config.Global.DB_HOST,
		config.Global.DB_PASSWORD,
		config.Global.DB_NAME,
		config.Global.DB_PORT,
	)

	var db *gorm.DB
	var err error

	// Retry 5 times with a 2-second delay.
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
	db.AutoMigrate(&models.User{}, &models.Project{})

	return db
}
