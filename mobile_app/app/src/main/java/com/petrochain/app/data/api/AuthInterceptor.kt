package com.petrochain.app.data.api

import com.petrochain.app.util.TokenManager
import okhttp3.Interceptor
import okhttp3.Response

/**
 * OkHttp interceptor that automatically attaches the Sanctum Bearer token
 * to every API request (except login which doesn't need it).
 */
class AuthInterceptor : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = TokenManager.getToken()

        val request = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .header("Accept", "application/json")
                .build()
        } else {
            originalRequest.newBuilder()
                .header("Accept", "application/json")
                .build()
        }

        return chain.proceed(request)
    }
}
