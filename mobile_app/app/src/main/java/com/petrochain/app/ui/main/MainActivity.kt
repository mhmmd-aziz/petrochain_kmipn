package com.petrochain.app.ui.main

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.petrochain.app.R
import com.petrochain.app.databinding.ActivityMainBinding
import com.petrochain.app.ui.auth.LoginActivity
import com.petrochain.app.util.TokenManager

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupNavigation()
    }

    private fun setupNavigation() {
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.nav_host_fragment) as NavHostFragment
        val navController = navHostFragment.navController

        val role = TokenManager.getUserRole()

        // Set start destination based on role
        val navGraph = navController.navInflater.inflate(R.navigation.nav_graph)
        navGraph.setStartDestination(
            if (role == "operator") R.id.spbuDashboardFragment
            else R.id.homeFragment
        )
        navController.graph = navGraph

        if (role == "operator") {
            binding.bottomNavPublic.visibility = android.view.View.GONE
            binding.bottomNavOperator.visibility = android.view.View.VISIBLE
            binding.bottomNavOperator.setupWithNavController(navController)
            binding.bottomNavOperator.setOnItemReselectedListener { item ->
                navController.popBackStack(item.itemId, false)
            }
        } else {
            binding.bottomNavOperator.visibility = android.view.View.GONE
            binding.bottomNavPublic.visibility = android.view.View.VISIBLE
            binding.bottomNavPublic.setupWithNavController(navController)
            binding.bottomNavPublic.setOnItemReselectedListener { item ->
                navController.popBackStack(item.itemId, false)
            }
        }

        // Hide bottom navigation on certain screens
        navController.addOnDestinationChangedListener { _, destination, _ ->
            when (destination.id) {
                R.id.qrCodeFragment,
                R.id.scanQrFragment,
                R.id.validateVehicleFragment,
                R.id.validateMotorFragment,
                R.id.mapFragment,
                R.id.spbuDetailFragment -> {
                    binding.bottomNavigationContainer.visibility = android.view.View.GONE
                }
                else -> {
                    binding.bottomNavigationContainer.visibility = android.view.View.VISIBLE
                }
            }
        }
    }

    fun logout() {
        TokenManager.clearSession()
        startActivity(Intent(this, LoginActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        })
        finish()
    }
}
