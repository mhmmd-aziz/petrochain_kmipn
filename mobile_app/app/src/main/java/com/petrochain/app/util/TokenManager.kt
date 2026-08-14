package com.petrochain.app.util

import android.content.Context
import android.content.SharedPreferences
import com.petrochain.app.PetrochainApp

/**
 * Manages authentication token and user session data using SharedPreferences.
 */
object TokenManager {

    private val prefs: SharedPreferences by lazy {
        PetrochainApp.instance.getSharedPreferences(
            Constants.PREFS_NAME,
            Context.MODE_PRIVATE
        )
    }

    fun saveToken(token: String) {
        prefs.edit().putString(Constants.KEY_AUTH_TOKEN, token).apply()
    }

    fun getToken(): String? {
        return prefs.getString(Constants.KEY_AUTH_TOKEN, null)
    }

    fun saveUserData(id: Int, name: String, email: String, role: String) {
        prefs.edit().apply {
            putInt(Constants.KEY_USER_ID, id)
            putString(Constants.KEY_USER_NAME, name)
            putString(Constants.KEY_USER_EMAIL, email)
            putString(Constants.KEY_USER_ROLE, role)
            apply()
        }
    }

    fun getUserName(): String = prefs.getString(Constants.KEY_USER_NAME, "") ?: ""
    fun getUserEmail(): String = prefs.getString(Constants.KEY_USER_EMAIL, "") ?: ""
    fun getUserRole(): String = prefs.getString(Constants.KEY_USER_ROLE, "public") ?: "public"
    fun getUserId(): Int = prefs.getInt(Constants.KEY_USER_ID, 0)

    fun isLoggedIn(): Boolean = getToken() != null

    fun clearSession() {
        prefs.edit().clear().apply()
    }
}
