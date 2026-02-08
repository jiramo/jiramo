package config

import (
	"os"
)

type Config struct {
	DB_HOST      string
	DB_USER      string
	DB_PASSWORD  string
	DB_NAME      string
	DB_PORT      string
	JWT_SECRET   string
	FRONTEND_URL string
}

var Global *Config

func init() {
	Global = &Config{
		DB_HOST:      getEnv("DB_HOST", ""),
		DB_USER:      getEnv("DB_USER", ""),
		DB_PASSWORD:  getEnv("DB_PASSWORD", ""),
		DB_NAME:      getEnv("DB_NAME", ""),
		DB_PORT:      getEnv("DB_PORT", "3306"),
		JWT_SECRET:   getEnv("JWT_SECRET", ""),
		FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:5173"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
