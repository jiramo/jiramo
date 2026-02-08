package models

type State int

const (
	NoDB State = iota
	NoAdmin
	Ready
)

var AppState State
