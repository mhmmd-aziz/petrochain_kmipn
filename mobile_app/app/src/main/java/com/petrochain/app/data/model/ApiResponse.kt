package com.petrochain.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * Generic wrapper for all API responses from Laravel backend.
 * Format: { "status": "success|error", "message": "...", "data": { ... } }
 */
data class ApiResponse<T>(
    @SerializedName("status") val status: String,
    @SerializedName("message") val message: String? = null,
    @SerializedName("data") val data: T? = null
) {
    val isSuccess: Boolean get() = status == "success"
}
