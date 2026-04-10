package utils

import (
	"math"
	"sync"
	"time"
)

type RateLimiter struct {
	mutex       sync.Mutex
	windows     map[string]*keyState
	windowSize  time.Duration
	alpha       float64
	tolerance   float64
	minRequests float64
}

type keyState struct {
	emaRate     float64
	windowCount int
	windowStart time.Time
}

var DefaultRateLimiter = NewRateLimiter(
	30*time.Second,
	0.3,
	2.5,
	5,
)

func NewRateLimiter(windowSize time.Duration, alpha, tolerance, minRequests float64) *RateLimiter {
	rateLimiter := &RateLimiter{
		windows:     make(map[string]*keyState),
		windowSize:  windowSize,
		alpha:       alpha,
		tolerance:   tolerance,
		minRequests: minRequests,
	}
	go rateLimiter.cleanup()
	return rateLimiter
}

func (rateLimiter *RateLimiter) Allow(keyID string) bool {
	rateLimiter.mutex.Lock()
	defer rateLimiter.mutex.Unlock()

	now := time.Now()
	state, exists := rateLimiter.windows[keyID]

	if !exists {
		rateLimiter.windows[keyID] = &keyState{
			emaRate:     1,
			windowCount: 1,
			windowStart: now,
		}
		return true
	}

	elapsed := now.Sub(state.windowStart)

	if elapsed >= rateLimiter.windowSize {
		state.emaRate = rateLimiter.alpha*float64(state.windowCount) + (1-rateLimiter.alpha)*state.emaRate
		state.windowCount = 1
		state.windowStart = now
		return true
	}

	state.windowCount++

	if state.emaRate < rateLimiter.minRequests {
		return true
	}

	fraction := elapsed.Seconds() / rateLimiter.windowSize.Seconds()
	if fraction < 0.01 {
		fraction = 0.01
	}
	projectedRate := float64(state.windowCount) / math.Max(fraction, 0.01)

	return projectedRate <= state.emaRate*rateLimiter.tolerance
}

func (rateLimiter *RateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		rateLimiter.mutex.Lock()
		cutoff := time.Now().Add(-10 * time.Minute)
		for k, s := range rateLimiter.windows {
			if s.windowStart.Before(cutoff) {
				delete(rateLimiter.windows, k)
			}
		}
		rateLimiter.mutex.Unlock()
	}
}
