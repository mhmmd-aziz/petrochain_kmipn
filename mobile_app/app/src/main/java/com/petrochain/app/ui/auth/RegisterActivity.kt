package com.petrochain.app.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.petrochain.app.data.model.RegisterRequest
import com.petrochain.app.databinding.ActivityRegisterBinding
import com.petrochain.app.ui.main.MainActivity
import com.petrochain.app.util.gone
import com.petrochain.app.util.visible

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private val viewModel: RegisterViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        observeViewModel()
    }

    private fun setupUI() {
        binding.tvLogin.setOnClickListener {
            finish()
        }

        binding.btnRegister.setOnClickListener {
            val name = binding.etName.text.toString().trim()
            val email = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()
            val confirmPassword = binding.etPasswordConfirm.text.toString().trim()

            var isValid = true

            if (name.isEmpty()) {
                binding.tilName.error = "Nama wajib diisi"
                isValid = false
            } else {
                binding.tilName.error = null
            }

            if (email.isEmpty()) {
                binding.tilEmail.error = "Email wajib diisi"
                isValid = false
            } else {
                binding.tilEmail.error = null
            }

            if (password.isEmpty() || password.length < 6) {
                binding.tilPassword.error = "Password minimal 6 karakter"
                isValid = false
            } else {
                binding.tilPassword.error = null
            }

            if (password != confirmPassword) {
                binding.tilPasswordConfirm.error = "Password tidak cocok"
                isValid = false
            } else {
                binding.tilPasswordConfirm.error = null
            }

            if (isValid) {
                val request = RegisterRequest(name, email, password, confirmPassword)
                viewModel.register(request)
            }
        }
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(this) { isLoading ->
            binding.btnRegister.isEnabled = !isLoading
            binding.btnRegister.text = if (isLoading) "" else "Daftar"
            if (isLoading) binding.progressBar.visible() else binding.progressBar.gone()
        }

        viewModel.registerResult.observe(this) { result ->
            result.onSuccess {
                Toast.makeText(this, "Registrasi berhasil, selamat datang ${it.user.name}!", Toast.LENGTH_SHORT).show()
                navigateToMain()
            }
            result.onFailure {
                Toast.makeText(this, it.message, Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        // Clear activity stack so user cannot press back to return to register/login
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
