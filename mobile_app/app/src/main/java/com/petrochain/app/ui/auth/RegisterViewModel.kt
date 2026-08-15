package com.petrochain.app.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petrochain.app.data.model.LoginData
import com.petrochain.app.data.model.RegisterRequest
import com.petrochain.app.data.repository.AuthRepository
import kotlinx.coroutines.launch

class RegisterViewModel : ViewModel() {

    private val repository = AuthRepository()

    private val _registerResult = MutableLiveData<Result<LoginData>>()
    val registerResult: LiveData<Result<LoginData>> = _registerResult

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    fun register(request: RegisterRequest) {
        _isLoading.value = true
        viewModelScope.launch {
            val result = repository.register(request)
            _registerResult.value = result
            _isLoading.value = false
        }
    }
}
