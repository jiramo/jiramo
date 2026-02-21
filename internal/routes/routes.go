package routes

import (
	"jiramo/internal/handler"
	"jiramo/internal/middleware"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/gorilla/mux"
)

func SetupRoutes(router *mux.Router, authHandlers *handler.AuthHandler, projectHandlers *handler.ProjectHandler, webHandler *handler.WebHandler, userHandlers *handler.UserHandler, setupHandler *handler.SetupHandler, profileHandler *handler.ProfileHandler) {
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		utils.WriteJSON(w, http.StatusOK, "Hello from jiramo API")
	})
	router.Handle("/", webHandler.UIHandler())

	// /setup
	setupRouter := router.PathPrefix("/setup").Subrouter()
	setupRouter.HandleFunc("/db", setupHandler.DBSetup).Methods("POST")
	setupRouter.HandleFunc("/admin", setupHandler.AdminSetup).Methods("POST")

	// /auth
	authRouter := router.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/refresh", authHandlers.Refresh).Methods("POST")
	authRouter.HandleFunc("/register", authHandlers.Register).Methods("POST")
	authRouter.HandleFunc("/login", authHandlers.Login).Methods("POST")

	// /users - user management
	userRouter := router.PathPrefix("/users").Subrouter()
	userRouter.Use(middleware.Auth)

	// user endpoint - accessible by every authenticated user
	userRouter.Handle("/me", middleware.RequireRole(models.RoleUser, models.RoleAdmin)(http.HandlerFunc(userHandlers.Me))).Methods("GET")

	//admin only endpoints
	userRouter.Handle("", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.ListUsers))).Methods("GET")
	userRouter.Handle("", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.CreateUser))).Methods("POST")
	userRouter.Handle("/{id}", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.GetUserByID))).Methods("GET")
	userRouter.Handle("/{id}", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.UpdateUserByID))).Methods("PUT", "PATCH")
	userRouter.Handle("/{id}", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.DeleteUserByID))).Methods("DELETE")

	// /profile - auth protected profile management
	profileRouter := router.PathPrefix("/profile").Subrouter()
	profileRouter.Use(middleware.Auth)
	profileRouter.HandleFunc("", profileHandler.GetProfile).Methods("GET")
	profileRouter.HandleFunc("", profileHandler.UpdateProfile).Methods("PUT", "PATCH")
	profileRouter.HandleFunc("", profileHandler.DeleteProfile).Methods("DELETE")
	profileRouter.HandleFunc("/password", profileHandler.ChangePassword).Methods("POST")

	// /projects - auth protected
	projectRouter := router.PathPrefix("/projects").Subrouter()
	projectRouter.Use(middleware.Auth)
	projectRouter.Use(middleware.RequireRole(models.RoleUser, models.RoleAdmin))
	projectRouter.HandleFunc("", projectHandlers.GetProjects).Methods("GET")
	projectRouter.HandleFunc("", projectHandlers.CreateProject).Methods("POST")

	// PUBLIC API
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
