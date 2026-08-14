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

        // Set appropriate bottom navigation menu based on user role
        val menuRes = if (role == "operator") {
            R.menu.bottom_nav_operator
        } else {
            R.menu.bottom_nav_public
        }
        binding.bottomNavigation.menu.clear()
        binding.bottomNavigation.inflateMenu(menuRes)

        // Set start destination based on role
        val navGraph = navController.navInflater.inflate(R.navigation.nav_graph)
        navGraph.setStartDestination(
            if (role == "operator") R.id.spbuDashboardFragment
            else R.id.homeFragment
        )
        navController.graph = navGraph

        // Connect bottom nav with NavController
        binding.bottomNavigation.setupWithNavController(navController)
    }

    fun logout() {
        TokenManager.clearSession()
        startActivity(Intent(this, LoginActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        })
        finish()
    }
}
