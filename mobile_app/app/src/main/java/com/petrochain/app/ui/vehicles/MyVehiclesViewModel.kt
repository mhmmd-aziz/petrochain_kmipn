package com.petrochain.app.ui.vehicles

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petrochain.app.data.model.VehicleData
import com.petrochain.app.data.repository.VehicleRepository
import kotlinx.coroutines.launch

class MyVehiclesViewModel : ViewModel() {

    private val repository = VehicleRepository()

    private val _vehicles = MutableLiveData<List<VehicleData>>()
    val vehicles: LiveData<List<VehicleData>> = _vehicles

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun loadVehicles() {
        _isLoading.value = true
        _error.value = null
        viewModelScope.launch {
            val result = repository.getMyVehicles()
            result.onSuccess {
                _vehicles.value = it
            }
            result.onFailure {
                _error.value = it.message
                _vehicles.value = emptyList()
            }
            _isLoading.value = false
        }
    }
}
