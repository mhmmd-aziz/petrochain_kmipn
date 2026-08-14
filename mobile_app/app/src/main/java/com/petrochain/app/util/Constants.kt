package com.petrochain.app.util

/**
 * Application-wide constants.
 * Change BASE_URL to your server IP when testing on a real device.
 */
object Constants {
    // Default: Android emulator alias for host machine's localhost
    // Change to your PC's IP (e.g. "http://192.168.1.5:8000/api/") for real device testing
    const val BASE_URL = "http://10.0.2.2:8000/api/"

    // SharedPreferences keys
    const val PREFS_NAME = "petrochain_prefs"
    const val KEY_AUTH_TOKEN = "auth_token"
    const val KEY_USER_NAME = "user_name"
    const val KEY_USER_EMAIL = "user_email"
    const val KEY_USER_ROLE = "user_role"
    const val KEY_USER_ID = "user_id"
}
