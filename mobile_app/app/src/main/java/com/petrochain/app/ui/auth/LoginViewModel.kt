package com.petrochain.app.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.petrochain.app.data.model.LoginData
import com.petrochain.app.data.repository.AuthRepository
import kotlinx.coroutines.launch

class LoginViewModel : ViewModel() {

    private val repository = AuthRepository()

    private val _loginResult = MutableLiveData<Result<LoginData>>()
    val loginResult: LiveData<Result<LoginData>> = _loginResult

    private val _isLoading = MutableLiveData(false)
    val isLoading: LiveData<Boolean> = _isLoading

    fun login(email: String, password: String) {
        _isLoading.value = true
        viewModelScope.launch {
            val result = repository.login(email, password)
            _loginResult.value = result
            _isLoading.value = false
        }
    }
}
