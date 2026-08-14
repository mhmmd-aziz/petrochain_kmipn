package com.petrochain.app

import android.app.Application

class PetrochainApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: PetrochainApp
            private set
    }
}
