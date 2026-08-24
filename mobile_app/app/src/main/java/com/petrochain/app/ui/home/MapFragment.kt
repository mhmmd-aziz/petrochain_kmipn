package com.petrochain.app.ui.home

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.gson.Gson
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentMapBinding
import com.petrochain.app.data.model.Spbu

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority

class MapFragment : Fragment() {

    private var _binding: FragmentMapBinding? = null
    private val binding get() = _binding!!
    private val viewModel: HomeViewModel by viewModels()
    private lateinit var spbuAdapter: SpbuAdapter
    private var currentFilter = "Semua"
    
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var locationCallback: LocationCallback? = null
    private var locationRequest: LocationRequest? = null
    private var userLat: Double = 5.104
    private var userLng: Double = 97.189

    private val requestPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { permissions ->
            val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
            val coarseLocationGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
            if (fineLocationGranted || coarseLocationGranted) {
                startLocationUpdates()
            }
        }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMapBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(requireActivity())

        locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
            .setMinUpdateIntervalMillis(2000)
            .build()
            
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    if (location != null) {
                        userLat = location.latitude
                        userLng = location.longitude
                        binding.fullscreenMap.evaluateJavascript("javascript:setUserLocation($userLat, $userLng);", null)
                        viewModel.spbus.value?.let { updateUIWithData(it) }
                    }
                }
            }
        }

        binding.toolbarMap.setNavigationOnClickListener {
            findNavController().navigateUp()
        }

        setupRecyclerView()
        setupMap()
        setupFilters()
        observeViewModel()
        
        viewModel.loadSpbus()
    }

    override fun onResume() {
        super.onResume()
        checkLocationPermission()
    }

    override fun onPause() {
        super.onPause()
        stopLocationUpdates()
    }

    private fun checkLocationPermission() {
        if (ContextCompat.checkSelfPermission(
                requireContext(),
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            startLocationUpdates()
        } else {
            requestPermissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION
                )
            )
        }
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        locationRequest?.let { req ->
            locationCallback?.let { cb ->
                fusedLocationClient.requestLocationUpdates(req, cb, android.os.Looper.getMainLooper())
            }
        }
        
        // Coba fetch sekali secara instan
        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null).addOnSuccessListener { location ->
            if (location != null) {
                userLat = location.latitude
                userLng = location.longitude
                binding.fullscreenMap.evaluateJavascript("javascript:setUserLocation($userLat, $userLng);", null)
                viewModel.spbus.value?.let { updateUIWithData(it) }
            }
        }
    }

    private fun stopLocationUpdates() {
        locationCallback?.let { cb ->
            fusedLocationClient.removeLocationUpdates(cb)
        }
    }

    private fun setupRecyclerView() {
        spbuAdapter = SpbuAdapter(emptyList()) { spbu ->
            val bundle = Bundle().apply {
                putString("spbuJson", Gson().toJson(spbu))
            }
            findNavController().navigate(R.id.action_map_to_detail, bundle)
        }
        binding.rvMapSpbu.layoutManager = LinearLayoutManager(requireContext())
        binding.rvMapSpbu.adapter = spbuAdapter
    }

    private fun setupFilters() {
        binding.chipFilterSemua.setOnClickListener { applyFilter("Semua") }
        binding.chipFilterPertalite.setOnClickListener { applyFilter("Pertalite") }
        binding.chipFilterSolar.setOnClickListener { applyFilter("Solar") }
    }

    private fun applyFilter(filter: String) {
        currentFilter = filter
        updateChipStyle(binding.chipFilterSemua, filter == "Semua")
        updateChipStyle(binding.chipFilterPertalite, filter == "Pertalite")
        updateChipStyle(binding.chipFilterSolar, filter == "Solar")
        viewModel.spbus.value?.let { updateUIWithData(it) }
    }

    private fun updateChipStyle(chip: TextView, isSelected: Boolean) {
        if (isSelected) {
            chip.setBackgroundResource(R.drawable.bg_badge_available)
            chip.backgroundTintList = android.content.res.ColorStateList.valueOf(android.graphics.Color.parseColor("#980f12"))
            chip.setTextColor(android.graphics.Color.WHITE)
        } else {
            chip.setBackgroundResource(R.drawable.bg_search_bar)
            chip.backgroundTintList = null
            chip.setTextColor(android.graphics.Color.parseColor("#4B5563"))
        }
    }

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    private fun setupMap() {
        val webView = binding.fullscreenMap
        webView.settings.javaScriptEnabled = true
        webView.settings.cacheMode = WebSettings.LOAD_NO_CACHE
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(WebAppInterface(), "Android")
        webView.loadUrl("file:///android_asset/leaflet_fullscreen.html")
    }

    private inner class WebAppInterface {
        @JavascriptInterface
        fun onMarkerClick(spbuId: Int) {
            activity?.runOnUiThread {
                val clickedSpbu = viewModel.spbus.value?.find { it.id == spbuId }
                if (clickedSpbu != null) {
                    val bundle = Bundle().apply {
                        putString("spbuJson", Gson().toJson(clickedSpbu))
                    }
                    findNavController().navigate(R.id.action_map_to_detail, bundle)
                }
            }
        }
    }

    private fun observeViewModel() {
        viewModel.spbus.observe(viewLifecycleOwner) { spbuList ->
            updateUIWithData(spbuList)
        }
    }

    private fun updateUIWithData(spbuList: List<Spbu>) {
        val filteredList = (if (currentFilter == "Semua") {
            spbuList
        } else {
            spbuList.filter { spbu ->
                spbu.fuelStocks?.any { 
                    it.fuelType.equals(currentFilter, ignoreCase = true) && 
                    (it.status == "available" || it.status == "limited") 
                } == true
            }
        }).sortedBy { spbu ->
            if (spbu.latitude != null && spbu.longitude != null) {
                val results = FloatArray(1)
                android.location.Location.distanceBetween(userLat, userLng, spbu.latitude, spbu.longitude, results)
                results[0]
            } else {
                Float.MAX_VALUE
            }
        }

        spbuAdapter.updateData(filteredList, userLat, userLng)
        val jsonSpbus = Gson().toJson(filteredList)
        binding.fullscreenMap.evaluateJavascript("javascript:setSpbus('$jsonSpbus');", null)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
