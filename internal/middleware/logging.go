package middleware

import (
	"log"
	"net/http"
	"time"
)

const (
	Reset  = "\033[0m"
	Red    = "\033[31m"
	Green  = "\033[32m"
	Yellow = "\033[33m"
	Blue   = "\033[34m"
	Cyan   = "\033[36m"
)

func colorForMethod(method string) string {
	switch method {
	case "GET":
		return Blue
	case "POST":
		return Green
	case "PUT":
		return Yellow
	case "DELETE":
		return Red
	default:
		return Cyan
	}
}

func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		lrw := &loggingResponseWriter{w, http.StatusOK}
		next.ServeHTTP(lrw, r)

		duration := time.Since(start)

		methodColor := colorForMethod(r.Method)

		client := r.RemoteAddr
		log.Printf("%s%s%s %s%s%s %d %s in %v",
			methodColor, r.Method, Reset,
			Cyan, r.RequestURI, Reset,
			lrw.statusCode,
			client,
			duration,
		)
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

// colorForStatus restituisce un colore in base allo status code
func colorForStatus(code int) string {
	switch {
	case code >= 200 && code < 300:
		return Green
	case code >= 300 && code < 400:
		return Cyan
	case code >= 400 && code < 500:
		return Yellow
	default:
		return Red
	}
}
