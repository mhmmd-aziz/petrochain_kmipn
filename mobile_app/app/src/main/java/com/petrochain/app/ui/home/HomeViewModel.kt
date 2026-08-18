package com.petrochain.app.ui.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petrochain.app.data.model.VehicleData
import com.petrochain.app.data.repository.VehicleRepository
import com.petrochain.app.util.TokenManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.isActive

class HomeViewModel : ViewModel() {

    private val repository = VehicleRepository()
    private val spbuRepository = com.petrochain.app.data.repository.SpbuRepository()

    private val _spbus = MutableLiveData<List<com.petrochain.app.data.model.Spbu>>()
    val spbus: LiveData<List<com.petrochain.app.data.model.Spbu>> = _spbus

    private val _vehicles = MutableLiveData<List<VehicleData>>()
    val vehicles: LiveData<List<VehicleData>> = _vehicles

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    val userName: String get() = TokenManager.getUserName()
    val userRole: String get() = TokenManager.getUserRole()

    val totalVehicles: Int get() = _vehicles.value?.size ?: 0
    val pendingCount: Int get() = _vehicles.value?.count {
        it.registrationStatus == "pending" || it.registrationStatus == "pending_review"
    } ?: 0
    val approvedCount: Int get() = _vehicles.value?.count {
        it.registrationStatus == "approved"
    } ?: 0

    fun loadVehicles() {
        _isLoading.value = true
        viewModelScope.launch {
            val result = repository.getMyVehicles()
            result.onSuccess { _vehicles.value = it }
            result.onFailure { _vehicles.value = emptyList() }
            _isLoading.value = false
        }
    }

    private var isPollingSpbus = false

    fun loadSpbus() {
        if (isPollingSpbus) return
        isPollingSpbus = true
        viewModelScope.launch {
            while (isActive) {
                val result = spbuRepository.getPublicSpbus()
                result.onSuccess { 
                    if (it.isNotEmpty()) {
                        _spbus.value = it 
                    }
                }
                // Jika gagal (misal koneksi putus sesaat), jangan hapus data yang sudah ada
                // result.onFailure { _spbus.value = emptyList() }
                delay(3000) // Poll every 3 seconds for real-time feel
            }
        }
    }
}
