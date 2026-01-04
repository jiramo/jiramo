package types

import "jiramo/internal/utils"

type ContextKey string

const UserKey ContextKey = "user"

type Claims = utils.Claims
