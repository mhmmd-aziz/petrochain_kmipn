package com.petrochain.app.ui.spbu

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petrochain.app.data.model.QrValidationData
import com.petrochain.app.data.model.VehicleValidationData
import com.petrochain.app.data.repository.SpbuRepository
import kotlinx.coroutines.launch
import java.io.File

class SpbuViewModel : ViewModel() {

    private val repository = SpbuRepository()

    // QR Validation
    private val _qrResult = MutableLiveData<Result<QrValidationData>?>()
    val qrResult: LiveData<Result<QrValidationData>?> = _qrResult

    // Vehicle Validation
    private val _vehicleResult = MutableLiveData<Result<VehicleValidationData>?>()
    val vehicleResult: LiveData<Result<VehicleValidationData>?> = _vehicleResult

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    // Temporarily hold QR validation data for the validate vehicle flow
    var currentQrData: QrValidationData? = null

    fun validateQr(qrCode: String) {
        _isLoading.value = true
        viewModelScope.launch {
            val result = repository.validateQr(qrCode)
            result.onSuccess { currentQrData = it }
            _qrResult.value = result
            _isLoading.value = false
        }
    }

    fun validateVehicle(vehicleId: Int, imageFile: File) {
        _isLoading.value = true
        viewModelScope.launch {
            val result = repository.validateVehicle(vehicleId, imageFile)
            _vehicleResult.value = result
            _isLoading.value = false
        }
    }

    fun clearResults() {
        _qrResult.value = null
        _vehicleResult.value = null
        currentQrData = null
    }

    private val _transactionResult = MutableLiveData<Result<com.petrochain.app.data.model.TransactionData>>()
    val transactionResult: LiveData<Result<com.petrochain.app.data.model.TransactionData>> = _transactionResult

    fun submitTransaction(request: com.petrochain.app.data.model.SubmitTransactionRequest) {
        _isLoading.value = true
        viewModelScope.launch {
            val result = repository.submitTransaction(request)
            _transactionResult.value = result
            _isLoading.value = false
        }
    }
}
