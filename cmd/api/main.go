package main

import (
	"jiramo/internal/db"
	"jiramo/internal/handlers"
	"jiramo/internal/middleware"
	"log"
	"net/http"
)

func main() {
	database := db.Connect()
	authHandler := handlers.NewAuthHandler(database)
	mux := http.NewServeMux()

	// Public Routes
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello from jiramo API"))
	})

	mux.HandleFunc("/auth/register", authHandler.Register)
	mux.HandleFunc("/auth/login", authHandler.Login)
	mux.HandleFunc("/auth/refresh", authHandler.Refresh)
	mux.HandleFunc("/auth/logout", authHandler.Logout)

	// Protected Routes
	mux.Handle("/user/profile", middleware.Auth(authHandler.RefreshInternal)(
		http.HandlerFunc(authHandler.Profile),
	))

	// Chain Middleware: Security Headers -> ServeMux
	finalHandler := middleware.SecureHeaders(mux)

	log.Println("Jiramo running on :8080")
	if err := http.ListenAndServe(":8080", finalHandler); err != nil {
		log.Fatal(err)
	}
}
