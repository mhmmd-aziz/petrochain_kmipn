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

/**
 * Fuel Stock representation for an SPBU
 */
data class FuelStock(
    @SerializedName("id") val id: Int,
    @SerializedName("fuel_type") val fuelType: String,
    @SerializedName("status") val status: String,
    @SerializedName("last_updated_at") val lastUpdatedAt: String?
)

/**
 * SPBU representation for public listing
 */
data class Spbu(
    @SerializedName("id") val id: Int,
    @SerializedName("code") val code: String,
    @SerializedName("name") val name: String,
    @SerializedName("address") val address: String,
    @SerializedName("city") val city: String,
    @SerializedName("image_url") val imageUrl: String?,
    @SerializedName("latitude") val latitude: Double?,
    @SerializedName("longitude") val longitude: Double?,
    @SerializedName("fuel_stocks") val fuelStocks: List<FuelStock>?
)

data class SubmitTransactionRequest(
    @SerializedName("vehicle_id") val vehicleId: Int?,
    @SerializedName("fuel_type") val fuelType: String,
    @SerializedName("volume") val volume: Double,
    @SerializedName("qr_result") val qrResult: String,
    @SerializedName("plate_result") val plateResult: String?,
    @SerializedName("plate_confidence") val plateConfidence: Double?,
    @SerializedName("is_override") val isOverride: Boolean? = false
)

data class TransactionData(
    @SerializedName("id") val id: Int,
    @SerializedName("vehicle_id") val vehicleId: Int?,
    @SerializedName("fuel_type") val fuelType: String,
    @SerializedName("volume") val volume: Double,
    @SerializedName("transaction_status") val transactionStatus: String
)

data class QuotaData(
    @SerializedName("remaining_quota") val remainingQuota: Double,
    @SerializedName("max_quota") val maxQuota: Double,
    @SerializedName("used_today") val usedToday: Double
)
