package utils

import (
	"crypto/sha256"
	"fmt"
	"net/http"
	"strings"
	"time"
)

const SessionTTL = 30 * time.Minute

func VisitorFingerprint(r *http.Request, projectID string) string {
	ip := realIP(r)
	userAgent := r.UserAgent()
	raw := ip + "|" + userAgent + "|" + projectID
	sum := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%x", sum)
}

func NewSessionID(visitorID string) string {
	raw := visitorID + "|" + fmt.Sprintf("%d", time.Now().UnixNano())
	sum := sha256.Sum256([]byte(raw))
	return fmt.Sprintf("%x", sum)
}

func SessionExpiresAt() time.Time {
	return time.Now().Add(SessionTTL)
}

func ParseUserAgent(ua string) (browser, os, device string) {
	uaLow := strings.ToLower(ua)

	switch {
	case strings.Contains(uaLow, "mobile"):
		device = "mobile"
	case strings.Contains(uaLow, "tablet") || strings.Contains(uaLow, "ipad"):
		device = "tablet"
	default:
		device = "desktop"
	}

	switch {
	case strings.Contains(uaLow, "windows"):
		os = "Windows"
	case strings.Contains(uaLow, "mac os") || strings.Contains(uaLow, "macos"):
		os = "macOS"
	case strings.Contains(uaLow, "iphone") || strings.Contains(uaLow, "ipad"):
		os = "iOS"
	case strings.Contains(uaLow, "android"):
		os = "Android"
	case strings.Contains(uaLow, "linux"):
		os = "Linux"
	default:
		os = "Other"
	}

	switch {
	case strings.Contains(uaLow, "edg/") || strings.Contains(uaLow, "edge/"):
		browser = "Edge"
	case strings.Contains(uaLow, "opr/") || strings.Contains(uaLow, "opera"):
		browser = "Opera"
	case strings.Contains(uaLow, "firefox"):
		browser = "Firefox"
	case strings.Contains(uaLow, "chrome") && !strings.Contains(uaLow, "chromium"):
		browser = "Chrome"
	case strings.Contains(uaLow, "safari") && !strings.Contains(uaLow, "chrome"):
		browser = "Safari"
	case strings.Contains(uaLow, "chromium"):
		browser = "Chromium"
	default:
		browser = "Other"
	}

	return
}

func realIP(r *http.Request) string {
	if ip := r.Header.Get("X-Real-Ip"); ip != "" {
		return strings.TrimSpace(ip)
	}

	if ip := r.Header.Get("X-Forwarded-For"); ip != "" {
		parts := strings.Split(ip, ",")
		return strings.TrimSpace(parts[0])
	}

	addr := r.RemoteAddr
	if index := strings.LastIndex(addr, ":"); index != -1 {
		return addr[:index]
	}
	return addr
}

func ParseUTM(r *http.Request) (source, medium, campaign string) {
	return r.URL.Query().Get("utm_source"),
		r.URL.Query().Get("utm_medium"),
		r.URL.Query().Get("utm_campaign")
}
