package com.petrochain.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * Data inside the login API response.
 * Contains Sanctum token and basic user info.
 */
data class LoginData(
    @SerializedName("token") val token: String,
    @SerializedName("user") val user: UserData
)

/**
 * User profile data returned by the API.
 */
data class UserData(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("nik") val nik: String? = null
)
