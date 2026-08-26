package com.petrochain.app.data.repository

import com.petrochain.app.data.api.RetrofitClient
import com.petrochain.app.data.model.QrValidateRequest
import com.petrochain.app.data.model.QrValidationData
import com.petrochain.app.data.model.VehicleValidationData
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

/**
 * Repository for SPBU operator validation operations:
 * QR code scanning and vehicle plate verification via AI.
 */
class SpbuRepository {

    private val api = RetrofitClient.apiService

    suspend fun getPublicSpbus(): Result<List<com.petrochain.app.data.model.Spbu>> {
        return try {
            val response = api.getPublicSpbus()
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data ?: emptyList())
            } else {
                Result.failure(Exception(response.body()?.message ?: "Gagal memuat daftar SPBU"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }

    /**
     * Validate a scanned QR code against the database.
     * Returns vehicle data if the QR is valid and the vehicle is approved.
     */
    suspend fun validateQr(qrCode: String): Result<QrValidationData> {
        return try {
            val response = api.validateQr(QrValidateRequest(qrCode))
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data!!)
            } else {
                var errorMsg = response.body()?.message ?: "QR Code tidak valid"
                response.errorBody()?.string()?.let { errorString ->
                    try {
                        val jsonObject = org.json.JSONObject(errorString)
                        if (jsonObject.has("message")) errorMsg = jsonObject.getString("message")
                    } catch (e: Exception) {}
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }

    /**
     * Validate a physical vehicle's plate number against the registered plate.
     * The photo is forwarded to the YOLO+OCR AI service by Laravel.
     */
    suspend fun validateVehicle(
        vehicleId: Int,
        vehicleImageFile: File
    ): Result<VehicleValidationData> {
        return try {
            val vehicleIdBody = vehicleId.toString()
                .toRequestBody("text/plain".toMediaTypeOrNull())

            val imageRequestBody = vehicleImageFile
                .asRequestBody("image/*".toMediaTypeOrNull())
            val imagePart = MultipartBody.Part.createFormData(
                "vehicle_image", vehicleImageFile.name, imageRequestBody
            )

            val response = api.validateVehicle(vehicleIdBody, imagePart)
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data!!)
            } else {
                var errorMsg = response.body()?.message ?: "Validasi kendaraan gagal"
                response.errorBody()?.string()?.let { errorString ->
                    try {
                        val jsonObject = org.json.JSONObject(errorString)
                        if (jsonObject.has("message")) errorMsg = jsonObject.getString("message")
                    } catch (e: Exception) {}
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }

    suspend fun validateMotor(
        vehicleImageFile: File
    ): Result<VehicleValidationData> {
        return try {
            val imageRequestBody = vehicleImageFile
                .asRequestBody("image/*".toMediaTypeOrNull())
            val imagePart = MultipartBody.Part.createFormData(
                "vehicle_image", vehicleImageFile.name, imageRequestBody
            )

            val response = api.validateMotor(imagePart)
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data!!)
            } else {
                var errorMsg = response.body()?.message ?: "Validasi motor gagal"
                response.errorBody()?.string()?.let { errorString ->
                    try {
                        val jsonObject = org.json.JSONObject(errorString)
                        if (jsonObject.has("message")) errorMsg = jsonObject.getString("message")
                    } catch (e: Exception) {}
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }

    suspend fun submitTransaction(request: com.petrochain.app.data.model.SubmitTransactionRequest): Result<com.petrochain.app.data.model.TransactionData> {
        return try {
            val response = api.submitTransaction(request)
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data!!)
            } else {
                var errorMsg = response.body()?.message ?: "Gagal memproses transaksi"
                response.errorBody()?.string()?.let { errorString ->
                    try {
                        val jsonObject = org.json.JSONObject(errorString)
                        if (jsonObject.has("message")) errorMsg = jsonObject.getString("message")
                    } catch (e: Exception) {}
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }
}
