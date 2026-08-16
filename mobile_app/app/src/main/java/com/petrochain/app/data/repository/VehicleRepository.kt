package com.petrochain.app.data.repository

import com.petrochain.app.data.api.RetrofitClient
import com.petrochain.app.data.model.RegisterData
import com.petrochain.app.data.model.VehicleData
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

/**
 * Repository for vehicle registration and listing operations.
 */
class VehicleRepository {

    private val api = RetrofitClient.apiService

    /**
     * Get all vehicles owned by the authenticated user.
     */
    suspend fun getMyVehicles(): Result<List<VehicleData>> {
        return try {
            val response = api.getMyVehicles()
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data ?: emptyList())
            } else {
                Result.failure(Exception("Gagal mengambil data kendaraan"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }

    /**
     * Register a new vehicle with STNK and car photo uploads.
     * Sends multipart/form-data to Laravel which then forwards to AI OCR service.
     */
    suspend fun registerVehicle(
        plateNumber: String,
        vehicleType: String,
        brand: String,
        model: String,
        engineCapacity: String,
        fuelType: String,
        stnkImageFile: File,
        carImageFile: File
    ): Result<RegisterData> {
        return try {
            val plateBody = plateNumber.toRequestBody("text/plain".toMediaTypeOrNull())
            val typeBody = vehicleType.toRequestBody("text/plain".toMediaTypeOrNull())
            val brandBody = brand.toRequestBody("text/plain".toMediaTypeOrNull())
            val modelBody = model.toRequestBody("text/plain".toMediaTypeOrNull())
            val engineCapacityBody = engineCapacity.toRequestBody("text/plain".toMediaTypeOrNull())
            val fuelTypeBody = fuelType.toRequestBody("text/plain".toMediaTypeOrNull())

            val stnkRequestBody = stnkImageFile.asRequestBody("image/*".toMediaTypeOrNull())
            val stnkPart = MultipartBody.Part.createFormData(
                "stnk_image", stnkImageFile.name, stnkRequestBody
            )

            val carRequestBody = carImageFile.asRequestBody("image/*".toMediaTypeOrNull())
            val carPart = MultipartBody.Part.createFormData(
                "car_image", carImageFile.name, carRequestBody
            )

            val response = api.registerVehicle(
                plateNumber = plateBody,
                vehicleType = typeBody,
                brand = brandBody,
                model = modelBody,
                engineCapacityCc = engineCapacityBody,
                fuelType = fuelTypeBody,
                stnkImage = stnkPart,
                carImage = carPart
            )

            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data!!)
            } else {
                val errorMsg = response.body()?.message ?: "Pendaftaran gagal"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }
}
