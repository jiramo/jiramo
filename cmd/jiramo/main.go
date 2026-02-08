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
	db, _ := db.ConnectFromEnv()
	setupHandler := handler.NewSetupHandler(db)
	authHandlers := handler.NewAuthHandler(db)
	projectHandlers := handler.NewProjectHandler(db)
	userHandler := handler.NewUserHandler(db)
	webHandler := handler.NewWebHandler()

	router := mux.NewRouter()

	router.Use(middleware.Recover)
	router.Use(middleware.Logging)
	router.Use(middleware.AppState)

	routes.SetupRoutes(router, authHandlers, projectHandlers, webHandler, userHandler, setupHandler)

	fmt.Println("Server avviato su :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
