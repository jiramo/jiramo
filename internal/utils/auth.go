package utils

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrPasswordMismatch = errors.New("password does not match")
	ErrPasswordHash     = errors.New("failed to hash password")
)

func VerifyPassword(password, hash string) error {
	if !CheckPasswordHash(password, hash) {
		return ErrPasswordHash
	}
	return nil
}

func HashPasswordSafe(password string) (string, error) {
	hash, err := HashPassword(password)
	if err != nil {
		return "", ErrPasswordHash
	}
	return hash, nil
}
