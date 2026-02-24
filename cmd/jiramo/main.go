package main

import (
	"fmt"
	"jiramo/internal/config"
	"jiramo/internal/db"
	"jiramo/internal/handler"
	"jiramo/internal/middleware"
	"jiramo/internal/models"
	"jiramo/internal/routes"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func main() {
	var DB *gorm.DB
	dbConfig, err := config.LoadDBConfig()
	if err != nil {
		log.Printf("Error loading DB config: %v", err)
	} else if dbConfig != nil {
		log.Println("Found saved DB configuration, connecting...")
		DB, _ = db.Connect(
			dbConfig.User,
			dbConfig.Host,
			dbConfig.Password,
			dbConfig.Name,
			dbConfig.Port,
		)
	} else if config.Global.DB_HOST != "" && config.Global.DB_NAME != "" {
		DB, _ = db.ConnectFromEnv()
	}

	if DB == nil {
		models.AppState = models.NoDB
		log.Println("Application state: NO DB - setup required")
	}

	setupHandler := handler.NewSetupHandler(DB)
	authHandlers := handler.NewAuthHandler(DB)
	projectHandlers := handler.NewProjectHandler(DB)
	userHandler := handler.NewUserHandler(DB)
	webHandler := handler.NewWebHandler()
	profileHandlers := handler.NewProfileHandler(DB)
	analyticsHandlers := handler.NewAnalyticsHandler(DB)

	setupHandler.SetHandlerRegistry(&handler.HandlerRegistry{
		Auth:    authHandlers,
		Project: projectHandlers,
		User:    userHandler,
		Profile: profileHandlers,
	})

	router := mux.NewRouter()

	router.Use(middleware.Recover)
	router.Use(middleware.Logging)
	router.Use(middleware.AppState)

	routes.SetupRoutes(router, authHandlers, projectHandlers, webHandler, userHandler, setupHandler, profileHandlers, analyticsHandlers)

	fmt.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
