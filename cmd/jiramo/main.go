package main

import (
	"fmt"
	"jiramo/internal/db"
	"jiramo/internal/handler"
	"jiramo/internal/routes"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	db := db.Connect()
	authHandlers := handler.NewAuthHandler(db)
	projectHandlers := handler.NewProjectHandler(db)
	userHandler := handler.NewUserHandler(db)
	webHandler := handler.NewWebHandler()

	router := mux.NewRouter()

	routes.SetupRoutes(router, authHandlers, projectHandlers, webHandler, userHandler)

	fmt.Println("Server avviato su :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
