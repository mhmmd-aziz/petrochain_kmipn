package com.petrochain.app.data.api

import com.petrochain.app.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit API interface mapping all Laravel REST endpoints.
 */
interface ApiService {

    // ═══════════════════════════════════════
    // AUTH ENDPOINTS
    // ═══════════════════════════════════════

    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<LoginData>>

    @POST("register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<LoginData>>

    @GET("user")
    suspend fun getUser(): Response<ApiResponse<UserData>>

    @POST("logout")
    suspend fun logout(): Response<ApiResponse<Any>>

    // ═══════════════════════════════════════
    // VEHICLE / REGISTRATION ENDPOINTS
    // ═══════════════════════════════════════

    @GET("public/spbus")
    suspend fun getPublicSpbus(): Response<ApiResponse<List<Spbu>>>

    @GET("my-vehicles")
    suspend fun getMyVehicles(): Response<ApiResponse<List<VehicleData>>>

    @Multipart
    @POST("register-vehicle")
    suspend fun registerVehicle(
        @Part("plate_number") plateNumber: RequestBody,
        @Part("vehicle_type") vehicleType: RequestBody,
        @Part("brand") brand: RequestBody,
        @Part("model") model: RequestBody,
        @Part("engine_capacity_cc") engineCapacityCc: RequestBody,
        @Part("fuel_type") fuelType: RequestBody,
        @Part stnkImage: MultipartBody.Part,
        @Part carImage: MultipartBody.Part
    ): Response<ApiResponse<RegisterData>>

    // ═══════════════════════════════════════
    // SPBU OPERATOR ENDPOINTS
    // ═══════════════════════════════════════

    @POST("spbu/validate-qr")
    suspend fun validateQr(@Body request: QrValidateRequest): Response<ApiResponse<QrValidationData>>

    @Multipart
    @POST("spbu/validate-vehicle")
    suspend fun validateVehicle(
        @Part("vehicle_id") vehicleId: RequestBody,
        @Part vehicleImage: MultipartBody.Part
    ): Response<ApiResponse<VehicleValidationData>>

    @POST("spbu/submit-transaction")
    suspend fun submitTransaction(@Body request: SubmitTransactionRequest): Response<ApiResponse<TransactionData>>
}
