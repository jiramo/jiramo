package main

import (
	"fmt"
	"jiramo/internal/db"
	"jiramo/internal/handler"
	"jiramo/internal/middleware"
	"jiramo/internal/routes"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	DB, _ := db.ConnectFromEnv()
	setupHandler := handler.NewSetupHandler(DB)
	authHandlers := handler.NewAuthHandler(DB)
	projectHandlers := handler.NewProjectHandler(DB)
	userHandler := handler.NewUserHandler(DB)
	webHandler := handler.NewWebHandler()
	profileHandlers := handler.NewProfileHandler(DB)

	router := mux.NewRouter()

	router.Use(middleware.Recover)
	router.Use(middleware.Logging)
	router.Use(middleware.AppState)

	routes.SetupRoutes(router, authHandlers, projectHandlers, webHandler, userHandler, setupHandler, profileHandlers)

	fmt.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
