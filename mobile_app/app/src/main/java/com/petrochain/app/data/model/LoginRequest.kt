package com.petrochain.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * Request body for POST /api/login
 */
data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)
