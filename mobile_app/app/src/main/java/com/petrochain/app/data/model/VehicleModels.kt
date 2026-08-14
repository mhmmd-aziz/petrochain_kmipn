package com.petrochain.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * Vehicle data from GET /api/my-vehicles response.
 */
data class VehicleData(
    @SerializedName("id") val id: Int,
    @SerializedName("plate_number") val plateNumber: String,
    @SerializedName("vehicle_type") val vehicleType: String,
    @SerializedName("brand") val brand: String?,
    @SerializedName("model") val model: String?,
    @SerializedName("qr_code_url") val qrCodeUrl: String?,
    @SerializedName("registration_status") val registrationStatus: String,
    @SerializedName("submitted_at") val submittedAt: String?,
    @SerializedName("admin_notes") val adminNotes: String?
)

/**
 * Response data from POST /api/register-vehicle.
 */
data class RegisterData(
    @SerializedName("application_id") val applicationId: Int,
    @SerializedName("vehicle_id") val vehicleId: Int
)
