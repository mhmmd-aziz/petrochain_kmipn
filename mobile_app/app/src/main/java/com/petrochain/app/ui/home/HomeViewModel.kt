package com.petrochain.app.ui.home

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petrochain.app.data.model.VehicleData
import com.petrochain.app.data.repository.VehicleRepository
import com.petrochain.app.util.TokenManager
import kotlinx.coroutines.launch

class HomeViewModel : ViewModel() {

    private val repository = VehicleRepository()

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
}
