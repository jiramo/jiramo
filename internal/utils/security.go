package utils

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"net/http"
)

func GenerateOpaqueToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// HashToken crea un hash SHA256 del token per salvarlo nel DB (come le password)
func HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// GenerateFingerprint crea un'impronta unica del client
func GenerateFingerprint(r *http.Request) string {
	// Attenzione: Dietro load balancer (es. Nginx/Cloudflare) usa X-Forwarded-For
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	// Prendiamo solo la parte iniziale dell'IP per evitare blocchi su reti mobili dinamiche
	// O teniamo tutto per "massima sicurezza" come richiesto.

	userAgent := r.Header.Get("User-Agent")

	raw := ip + ":" + userAgent
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])
}
