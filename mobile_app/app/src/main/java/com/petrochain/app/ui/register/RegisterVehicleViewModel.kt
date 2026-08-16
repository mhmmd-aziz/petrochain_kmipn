package com.petrochain.app.ui.register

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petrochain.app.data.model.RegisterData
import com.petrochain.app.data.repository.VehicleRepository
import kotlinx.coroutines.launch
import java.io.File

class RegisterVehicleViewModel : ViewModel() {

    private val repository = VehicleRepository()

    private val _registerResult = MutableLiveData<Result<RegisterData>>()
    val registerResult: LiveData<Result<RegisterData>> = _registerResult

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    var stnkImageFile: File? = null
    var carImageFile: File? = null

    fun registerVehicle(
        plateNumber: String,
        vehicleType: String,
        brand: String,
        model: String,
        engineCapacity: String,
        fuelType: String
    ) {
        val stnk = stnkImageFile
        val car = carImageFile

        if (stnk == null || car == null) {
            _registerResult.value = Result.failure(
                Exception("Foto STNK dan foto kendaraan wajib diambil")
            )
            return
        }

        _isLoading.value = true
        viewModelScope.launch {
            val result = repository.registerVehicle(
                plateNumber = plateNumber,
                vehicleType = vehicleType,
                brand = brand,
                model = model,
                engineCapacity = engineCapacity,
                fuelType = fuelType,
                stnkImageFile = stnk,
                carImageFile = car
            )
            _registerResult.value = result
            _isLoading.value = false
        }
    }
}
