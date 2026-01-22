package config

import (
	"os"
)

type Config struct {
	DB_HOST     string
	DB_USER     string
	DB_PASSWORD string
	DB_NAME     string
	DB_PORT     string
	JWT_SECRET  string
}

var Global *Config

func init() {
	Global = &Config{
		DB_HOST:     getEnv("DB_HOST", "localhost"),
		DB_USER:     getEnv("DB_USER", "root"),
		DB_PASSWORD: getEnv("DB_PASSWORD", "password"),
		DB_NAME:     getEnv("DB_NAME", "mydb"),
		DB_PORT:     getEnv("DB_PORT", "3306"),
		JWT_SECRET:  getEnv("JWT_SECRET", "supersecret"),
	}
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
