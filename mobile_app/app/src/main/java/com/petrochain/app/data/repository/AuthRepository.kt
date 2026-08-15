package com.petrochain.app.data.repository

import com.petrochain.app.data.api.RetrofitClient
import com.petrochain.app.data.model.ApiResponse
import com.petrochain.app.data.model.LoginData
import com.petrochain.app.data.model.LoginRequest
import com.petrochain.app.data.model.UserData
import com.petrochain.app.util.TokenManager
import org.json.JSONObject

/**
 * Repository handling authentication operations:
 * login, logout, and user profile retrieval.
 */
class AuthRepository {

    private val api = RetrofitClient.apiService

    /**
     * Login and persist the Sanctum token + user data.
     */
    suspend fun login(email: String, password: String): Result<LoginData> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                val data = response.body()!!.data!!
                // Persist token and user info
                TokenManager.saveToken(data.token)
                TokenManager.saveUserData(
                    id = data.user.id,
                    name = data.user.name,
                    email = data.user.email,
                    role = data.user.role
                )
                Result.success(data)
            } else {
                val errorMsg = response.body()?.message ?: "Login gagal"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Tidak dapat terhubung ke server: ${e.message}"))
        }
    }

    /**
     * Register a new user account.
     * Parses both standard API errors and Laravel 422 validation errors.
     */
    suspend fun register(request: com.petrochain.app.data.model.RegisterRequest): Result<LoginData> {
        return try {
            val response = api.register(request)
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                val data = response.body()!!.data!!
                // Persist token and user info
                TokenManager.saveToken(data.token)
                TokenManager.saveUserData(
                    id = data.user.id,
                    name = data.user.name,
                    email = data.user.email,
                    role = data.user.role
                )
                Result.success(data)
            } else {
                // Parse error from response body (handles 422 validation errors)
                val errorMsg = try {
                    val errorBody = response.errorBody()?.string()
                    if (!errorBody.isNullOrEmpty()) {
                        val json = JSONObject(errorBody)
                        // Laravel validation errors: {"message":"...", "errors":{...}}
                        json.optString("message", "Registrasi gagal")
                    } else {
                        response.body()?.message ?: "Registrasi gagal"
                    }
                } catch (e: Exception) {
                    "Registrasi gagal"
                }
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Tidak dapat terhubung ke server: ${e.message}"))
        }
    }

    /**
     * Fetch current authenticated user profile.
     */
    suspend fun getUser(): Result<UserData> {
        return try {
            val response = api.getUser()
            if (response.isSuccessful && response.body()?.isSuccess == true) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception("Gagal mengambil profil pengguna"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Koneksi gagal: ${e.message}"))
        }
    }

    /**
     * Logout: destroy server token and clear local session.
     */
    suspend fun logout(): Result<Unit> {
        return try {
            api.logout()
            TokenManager.clearSession()
            Result.success(Unit)
        } catch (e: Exception) {
            // Still clear local session even if server call fails
            TokenManager.clearSession()
            Result.success(Unit)
        }
    }
}
