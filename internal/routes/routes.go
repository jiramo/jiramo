package routes

import (
	"jiramo/internal/handler"
	"jiramo/internal/middleware"
	"jiramo/internal/models"
	"jiramo/internal/utils"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

func SetupRoutes(router *mux.Router, authHandlers *handler.AuthHandler, projectHandlers *handler.ProjectHandler, webHandler *handler.WebHandler, userHandlers *handler.UserHandler, setupHandler *handler.SetupHandler, profileHandler *handler.ProfileHandler, analyticsHandler *handler.AnalyticsHandler, apiKeyHandler *handler.APIKeyHandler, db *gorm.DB) {
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		utils.WriteJSON(w, http.StatusOK, "Hello from jiramo API")
	})
	router.Handle("/", webHandler.UIHandler())

	// /api subrouter
	apiRouter := router.PathPrefix("/api").Subrouter()

	// /api/setup
	setupRouter := apiRouter.PathPrefix("/setup").Subrouter()
	setupRouter.HandleFunc("/status", setupHandler.Status).Methods("GET")
	setupRouter.HandleFunc("/db", setupHandler.DBSetup).Methods("POST")
	setupRouter.HandleFunc("/admin", setupHandler.AdminSetup).Methods("POST")

	// /api/auth
	authRouter := apiRouter.PathPrefix("/auth").Subrouter()
	authRouter.HandleFunc("/refresh", authHandlers.Refresh).Methods("POST")
	authRouter.HandleFunc("/register", authHandlers.Register).Methods("POST")
	authRouter.HandleFunc("/login", authHandlers.Login).Methods("POST")

	// /api/users - user management
	userRouter := apiRouter.PathPrefix("/users").Subrouter()
	userRouter.Use(middleware.Auth)

	// user endpoint - accessible by every authenticated user
	userRouter.Handle("/me", middleware.RequireRole(models.RoleUser, models.RoleAdmin)(http.HandlerFunc(userHandlers.Me))).Methods("GET")

	//admin only endpoints
	userRouter.Handle("", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.ListUsers))).Methods("GET")
	userRouter.Handle("", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.CreateUser))).Methods("POST")
	userRouter.Handle("/{id}", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.GetUserByID))).Methods("GET")
	userRouter.Handle("/{id}", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.UpdateUserByID))).Methods("PUT", "PATCH")
	userRouter.Handle("/{id}", middleware.RequireRole(models.RoleAdmin)(http.HandlerFunc(userHandlers.DeleteUserByID))).Methods("DELETE")

	// /api/profile - auth protected profile management
	profileRouter := apiRouter.PathPrefix("/profile").Subrouter()
	profileRouter.Use(middleware.Auth)
	profileRouter.HandleFunc("", profileHandler.GetProfile).Methods("GET")
	profileRouter.HandleFunc("", profileHandler.UpdateProfile).Methods("PUT", "PATCH")
	profileRouter.HandleFunc("", profileHandler.DeleteProfile).Methods("DELETE")
	profileRouter.HandleFunc("/password", profileHandler.ChangePassword).Methods("POST")

	// /api/projects - auth protected
	projectRouter := apiRouter.PathPrefix("/projects").Subrouter()
	projectRouter.Use(middleware.Auth)
	projectRouter.Use(middleware.RequireRole(models.RoleUser, models.RoleAdmin))
	projectRouter.HandleFunc("", projectHandlers.GetProjects).Methods("GET")
	projectRouter.HandleFunc("", projectHandlers.CreateProject).Methods("POST")
	projectRouter.HandleFunc("/{id}", projectHandlers.EditProject).Methods("PUT", "PATCH")
	projectRouter.HandleFunc("/{id}", projectHandlers.DeleteProject).Methods("DELETE")

	// projects - private
	statusRouter := apiRouter.PathPrefix("/projects/{id}").Subrouter()
	statusRouter.Use(middleware.AuthOrAPIKey(db))
	statusRouter.HandleFunc("/status", projectHandlers.GetProjectStatus).Methods("GET")
	statusRouter.HandleFunc("/status/set", projectHandlers.SetProjectStatus).Methods("POST")
	statusRouter.HandleFunc("/status/toggle", projectHandlers.ToggleProjectStatus).Methods("PATCH")

	// api keys - private
	apiKeyRouter := apiRouter.PathPrefix("/projects/{id}/apikeys").Subrouter()
	apiKeyRouter.Use(middleware.Auth)
	apiKeyRouter.Use(middleware.RequireRole(models.RoleAdmin))
	apiKeyRouter.HandleFunc("", apiKeyHandler.Create).Methods("POST")
	apiKeyRouter.HandleFunc("", apiKeyHandler.List).Methods("GET")
	apiKeyRouter.HandleFunc("/{keyId}", apiKeyHandler.Delete).Methods("DELETE")

	// analytics - public
	analyticsRouter := apiRouter.PathPrefix("/analytics").Subrouter()
	analyticsRouter.HandleFunc("/track", analyticsHandler.Track).Methods("POST")
	analyticsRouter.HandleFunc("/event", analyticsHandler.TrackEvent).Methods("POST")

	// analytics - private
	analyticsPrivateRouter := apiRouter.PathPrefix("/projects/{id}/analytics").Subrouter()
	analyticsPrivateRouter.Use(middleware.Auth)
	analyticsPrivateRouter.Use(middleware.RequireRole(models.RoleUser, models.RoleAdmin))
	analyticsPrivateRouter.HandleFunc("", analyticsHandler.GetProjectStats).Methods("GET")
	analyticsPrivateRouter.HandleFunc("/realtime", analyticsHandler.GetRealtimeStats).Methods("GET")

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
