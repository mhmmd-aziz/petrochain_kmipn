package com.petrochain.app.ui.home

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.viewpager2.widget.ViewPager2
import android.os.Handler
import android.os.Looper
import android.widget.ImageView
import android.widget.LinearLayout
import androidx.core.content.ContextCompat
import com.google.gson.Gson
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentHomeBinding
import com.petrochain.app.databinding.ItemSpbuBinding
import coil.load

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.result.contract.ActivityResultContracts
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private val viewModel: HomeViewModel by viewModels()
    private var currentFilter = "Semua"

    private val bannerHandler = Handler(Looper.getMainLooper())
    private var bannerRunnable: Runnable? = null
    private var currentBannerPage = 0

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
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
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
                        viewModel.spbus.value?.let { updateUIWithData(it) }
                    }
                }
            }
        }

        setupUI()
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
                fusedLocationClient.requestLocationUpdates(req, cb, Looper.getMainLooper())
            }
        }
        
        // Coba fetch sekali secara instan jika update interval terlalu lama
        fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null).addOnSuccessListener { location ->
            if (location != null) {
                userLat = location.latitude
                userLng = location.longitude
                viewModel.spbus.value?.let { updateUIWithData(it) }
            }
        }
    }

    private fun stopLocationUpdates() {
        locationCallback?.let { cb ->
            fusedLocationClient.removeLocationUpdates(cb)
        }
    }

    private fun setupUI() {
        binding.tvWelcomeName.text = "Selamat datang, ${viewModel.userName}"
        setupBanner()

        binding.btnCariSpbu?.setOnClickListener {
            findNavController().navigate(R.id.action_home_to_map)
        }
        
        binding.tvLihatSelengkapnya?.setOnClickListener {
            findNavController().navigate(R.id.action_home_to_map)
        }
        
        binding.btnNavVehicles?.setOnClickListener {
            requireActivity().findViewById<com.google.android.material.bottomnavigation.BottomNavigationView>(R.id.bottomNavPublic)
                ?.selectedItemId = R.id.myVehiclesFragment
        }
        
        binding.btnNavRegister?.setOnClickListener {
            requireActivity().findViewById<com.google.android.material.bottomnavigation.BottomNavigationView>(R.id.bottomNavPublic)
                ?.selectedItemId = R.id.registerVehicleFragment
        }
    }

    private fun setupFilters() {
        binding.chipFilterSemua?.setOnClickListener { applyFilter("Semua") }
        binding.chipFilterPertalite?.setOnClickListener { applyFilter("Pertalite") }
        binding.chipFilterSolar?.setOnClickListener { applyFilter("Solar") }
    }

    private fun applyFilter(filter: String) {
        currentFilter = filter
        updateChipStyle(binding.chipFilterSemua, filter == "Semua")
        updateChipStyle(binding.chipFilterPertalite, filter == "Pertalite")
        updateChipStyle(binding.chipFilterSolar, filter == "Solar")
        viewModel.spbus.value?.let { updateUIWithData(it) }
    }

    private fun updateChipStyle(chip: TextView?, isSelected: Boolean) {
        if (chip == null) return
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

    private fun observeViewModel() {
        viewModel.spbus.observe(viewLifecycleOwner) { spbuList ->
            updateUIWithData(spbuList)
        }
    }

    private fun updateUIWithData(spbuList: List<com.petrochain.app.data.model.Spbu>) {
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

        if (filteredList.isNotEmpty()) {
            binding.includedSpbu.root.visibility = View.VISIBLE
            val nearestSpbu = filteredList.first() // We assume the first one is nearest for now
            val spbuBinding = ItemSpbuBinding.bind(binding.includedSpbu.root)

            spbuBinding.tvSpbuName.text = nearestSpbu.name
            
            if (nearestSpbu.latitude != null && nearestSpbu.longitude != null && userLat != 0.0 && userLng != 0.0) {
                val results = FloatArray(1)
                android.location.Location.distanceBetween(userLat, userLng, nearestSpbu.latitude, nearestSpbu.longitude, results)
                val distanceKm = results[0] / 1000f
                spbuBinding.tvSpbuAddress.text = "${String.format("%.1f", distanceKm)} km • ${nearestSpbu.address}"
            } else {
                spbuBinding.tvSpbuAddress.text = nearestSpbu.address
            }

            if (!nearestSpbu.imageUrl.isNullOrEmpty()) {
                spbuBinding.ivSpbuImage.load(nearestSpbu.imageUrl) {
                    crossfade(true)
                    placeholder(R.drawable.img_spbu_placeholder)
                    error(R.drawable.img_spbu_placeholder)
                }
            } else {
                spbuBinding.ivSpbuImage.setImageResource(R.drawable.img_spbu_placeholder)
            }

            spbuBinding.llFuelStocks.removeAllViews()
            nearestSpbu.fuelStocks?.forEach { stock ->
                val badgeView = LayoutInflater.from(requireContext())
                    .inflate(R.layout.item_fuel_badge, binding.includedSpbu.llFuelStocks, false) as android.widget.LinearLayout
                
                val tvBadge = badgeView.findViewById<android.widget.TextView>(R.id.tvBadge)
                val ivBadgeIcon = badgeView.findViewById<android.widget.ImageView>(R.id.ivBadgeIcon)
                
                val fuelName = when (stock.fuelType.lowercase()) {
                    "pertamax_turbo" -> "P-Turbo"
                    else -> stock.fuelType.replaceFirstChar { it.uppercase() }
                }
                val statusName = when (stock.status.lowercase()) {
                    "available" -> "Ada"
                    "empty" -> "Habis"
                    "limited" -> "Terbatas"
                    else -> stock.status.replaceFirstChar { it.uppercase() }
                }
                tvBadge.text = "$fuelName: $statusName"
                
                val colorRes: Int
                if (stock.status == "empty") {
                    colorRes = android.graphics.Color.parseColor("#EF4444")
                    ivBadgeIcon.setImageResource(R.drawable.ic_block)
                } else if (stock.status == "limited") {
                    colorRes = android.graphics.Color.parseColor("#F59E0B")
                    ivBadgeIcon.setImageResource(R.drawable.ic_info)
                } else {
                    colorRes = android.graphics.Color.parseColor("#10B981")
                    ivBadgeIcon.setImageResource(R.drawable.ic_check)
                }

                tvBadge.setTextColor(colorRes)
                ivBadgeIcon.setColorFilter(colorRes)
                
                val bg = android.graphics.drawable.GradientDrawable()
                bg.shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                bg.cornerRadius = 40f
                bg.setColor(android.graphics.Color.WHITE)
                bg.setStroke(3, colorRes)
                badgeView.background = bg

                binding.includedSpbu.llFuelStocks.addView(badgeView)
            }
            spbuBinding.root.setOnClickListener {
                val bundle = Bundle().apply {
                    putString("spbuJson", Gson().toJson(nearestSpbu))
                }
                findNavController().navigate(R.id.action_home_to_detail, bundle)
            }
        } else {
            binding.includedSpbu.root.visibility = View.GONE
        }
    }

    private fun fuelShortName(fuelType: String): String = when (fuelType.lowercase()) {
        "pertalite" -> "Pertalite"
        "solar" -> "Solar"
        "pertamax" -> "Pertamax"
        "pertamax_turbo" -> "P-Turbo"
        "dex" -> "Dex"
        "dexlite" -> "Dexlite"
        else -> fuelType.replaceFirstChar { it.uppercase() }
    }

    private fun statusShortName(status: String): String = when (status.lowercase()) {
        "available" -> "Ada"
        "empty" -> "Habis"
        "limited" -> "Terbatas"
        else -> status.replaceFirstChar { it.uppercase() }
    }

    private fun setupBanner() {
        val bannerItems = listOf(
            BannerItem("Layanan Cerdas\nUntuk Kendaraan", "Terintegrasi Blockchain\nPetrochain Network", R.drawable.img_banner_illustration),
            BannerItem("Ekosistem\nPintar", "Jaringan Kendaraan Cerdas\nPetrochain Project", R.drawable.img_banner_motorcycle)
        )
        val adapter = HomeBannerAdapter(bannerItems)
        binding.vpBanner?.adapter = adapter

        setupDotIndicators(bannerItems.size)

        binding.vpBanner?.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                updateDotIndicators(position, bannerItems.size)
                currentBannerPage = position
                bannerRunnable?.let { bannerHandler.removeCallbacks(it) }
                bannerRunnable?.let { bannerHandler.postDelayed(it, 4000) }
            }
        })

        bannerRunnable = Runnable {
            if (_binding != null && binding.vpBanner?.adapter != null) {
                currentBannerPage = (currentBannerPage + 1) % bannerItems.size
                binding.vpBanner?.setCurrentItem(currentBannerPage, true)
            }
        }
        bannerRunnable?.let { bannerHandler.postDelayed(it, 4000) }
    }

    private fun setupDotIndicators(count: Int) {
        val dots = arrayOfNulls<ImageView>(count)
        binding.layoutDots?.removeAllViews()
        for (i in 0 until count) {
            dots[i] = ImageView(requireContext())
            dots[i]?.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.bg_dot))
            
            val params = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            params.setMargins(8, 0, 8, 0)
            binding.layoutDots?.addView(dots[i], params)
        }
    }

    private fun updateDotIndicators(position: Int, count: Int) {
        for (i in 0 until count) {
            val imageView = binding.layoutDots?.getChildAt(i) as? ImageView
            if (i == position) {
                imageView?.alpha = 1.0f
            } else {
                imageView?.alpha = 0.5f
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        bannerRunnable?.let { bannerHandler.removeCallbacks(it) }
        _binding = null
    }
}
