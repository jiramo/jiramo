package handler

import (
	"io/fs"
	"jiramo/internal/config"
	"jiramo/web"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

type WebHandler struct {
	FrontendURL string
	Env         string
	FS          fs.FS
}

func NewWebHandler() *WebHandler {
	embeddedFS, err := web.Dist()
	if err != nil {
		log.Fatal("Impossibile caricare frontend:", err)
	}

	return &WebHandler{
		FrontendURL: config.Global.FRONTEND_URL,
		Env:         os.Getenv("APP_ENV"),
		FS:          embeddedFS,
	}
}

func (h *WebHandler) UIHandler() http.Handler {

	if h.Env == "dev" {
		log.Printf("UI: Proxy verso %s", h.FrontendURL)

		target, _ := url.Parse(h.FrontendURL)
		return httputil.NewSingleHostReverseProxy(target)
	}

	fs := http.FileServer(http.FS(h.FS))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := h.FS.Open(strings.TrimPrefix(r.URL.Path, "/")); err != nil {
			r.URL.Path = "/index.html"
		}
		fs.ServeHTTP(w, r)
	})
}
