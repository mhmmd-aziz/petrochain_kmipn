package com.petrochain.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * Request body for POST /api/spbu/validate-qr
 */
data class QrValidateRequest(
    @SerializedName("qr_code") val qrCode: String
)

/**
 * Response data from POST /api/spbu/validate-qr (valid QR).
 */
data class QrValidationData(
    @SerializedName("vehicle_id") val vehicleId: Int,
    @SerializedName("plate_number") val plateNumber: String,
    @SerializedName("vehicle_type") val vehicleType: String,
    @SerializedName("brand") val brand: String?,
    @SerializedName("model") val model: String?
)

/**
 * Response data from POST /api/spbu/validate-vehicle.
 * Contains AI plate detection vs registered plate comparison.
 */
data class VehicleValidationData(
    @SerializedName("registered_plate") val registeredPlate: String,
    @SerializedName("detected_plate") val detectedPlate: String?,
    @SerializedName("confidence") val confidence: Double,
    @SerializedName("is_match") val isMatch: Boolean,
    @SerializedName("annotated_image") val annotatedImage: String?
)
