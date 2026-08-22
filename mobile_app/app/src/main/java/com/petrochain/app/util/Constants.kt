package com.petrochain.app.util

/**
 * Application-wide constants.
 * Change BASE_URL to your server IP when testing on a real device.
 */
object Constants {
    // Production URL: https://petrochain.my.id/api/
    const val BASE_URL = "https://petrochain.my.id/api/"

    // SharedPreferences keys
    const val PREFS_NAME = "petrochain_prefs"
    const val KEY_AUTH_TOKEN = "auth_token"
    const val KEY_USER_NAME = "user_name"
    const val KEY_USER_EMAIL = "user_email"
    const val KEY_USER_ROLE = "user_role"
    const val KEY_USER_ID = "user_id"
}
