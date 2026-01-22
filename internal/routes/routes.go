package routes

import (
	"jiramo/internal/handler"
	"jiramo/internal/middleware"
	"jiramo/internal/utils"
	"net/http"

	"github.com/gorilla/mux"
)

func SetupRoutes(router *mux.Router, authHandlers *handler.AuthHandler, projectHandlers *handler.ProjectHandler) {
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		utils.WriteJSON(w, http.StatusOK, "Hello from jiramo API")
	})

	// /auth
	authRouter := router.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/register", authHandlers.Register).Methods("POST")
	authRouter.HandleFunc("/login", authHandlers.Login).Methods("POST")

	// /projects - auth protected
	projectRouter := router.PathPrefix("/projects").Subrouter()
	projectRouter.Use(middleware.Auth)
	projectRouter.HandleFunc("", projectHandlers.CreateProject).Methods("POST")

	// PUBLIC
	router.HandleFunc("/projects/{id}/status", projectHandlers.ProjectStatus).Methods("GET")

	// ERRORS
	// 404
	router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		utils.WriteError(w, http.StatusNotFound, "route not found")
	})

	// 405
	router.MethodNotAllowedHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		utils.WriteError(w, http.StatusMethodNotAllowed, "method not allowed")
	})

}
