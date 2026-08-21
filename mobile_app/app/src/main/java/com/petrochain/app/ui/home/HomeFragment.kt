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
import com.google.gson.Gson
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentHomeBinding
import com.petrochain.app.databinding.ItemSpbuBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private val viewModel: HomeViewModel by viewModels()
    private var currentFilter = "Semua"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupUI()
        setupFilters()
        observeViewModel()
        viewModel.loadSpbus()
    }

    private fun setupUI() {
        binding.tvWelcomeName.text = "Selamat datang, ${viewModel.userName}"

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
        
        // Update UI styling for chips
        updateChipStyle(binding.chipFilterSemua, filter == "Semua")
        updateChipStyle(binding.chipFilterPertalite, filter == "Pertalite")
        updateChipStyle(binding.chipFilterSolar, filter == "Solar")

        // Re-trigger observer logic to apply filter
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
        val filteredList = if (currentFilter == "Semua") {
            spbuList
        } else {
            spbuList.filter { spbu ->
                spbu.fuelStocks?.any { 
                    it.fuelType.equals(currentFilter, ignoreCase = true) && 
                    (it.status == "available" || it.status == "limited") 
                } == true
            }
        }

        if (filteredList.isNotEmpty()) {
            binding.includedSpbu.root.visibility = View.VISIBLE
            val nearestSpbu = filteredList.first() // We assume the first one is nearest for now
            val spbuBinding = ItemSpbuBinding.bind(binding.includedSpbu.root)

            spbuBinding.tvSpbuName.text = nearestSpbu.name
            spbuBinding.tvSpbuAddress.text = nearestSpbu.address

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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
