package com.petrochain.app.ui.vehicles

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentMyVehiclesBinding
import com.petrochain.app.util.gone
import com.petrochain.app.util.showToast
import com.petrochain.app.util.visible

class MyVehiclesFragment : Fragment() {

    private var _binding: FragmentMyVehiclesBinding? = null
    private val binding get() = _binding!!
    private val viewModel: MyVehiclesViewModel by viewModels()
    private lateinit var adapter: VehicleAdapter
    private var currentTab = 0

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMyVehiclesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupRecyclerView()
        setupTabs()
        setupSwipeRefresh()
        observeViewModel()
        viewModel.loadVehicles()
    }

    private fun setupRecyclerView() {
        adapter = VehicleAdapter { vehicle ->
            if (vehicle.registrationStatus == "approved" && vehicle.qrCodeUrl != null) {
                val bundle = bundleOf(
                    "vehicle_id" to vehicle.id,
                    "qr_code_url" to vehicle.qrCodeUrl,
                    "plate_number" to vehicle.plateNumber,
                    "brand" to (vehicle.brand ?: ""),
                    "model" to (vehicle.model ?: ""),
                    "vehicle_type" to vehicle.vehicleType,
                    "fuel_type" to (vehicle.fuelType ?: "pertalite")
                )
                findNavController().navigate(R.id.qrCodeFragment, bundle)
            } else {
                showToast("Kendaraan belum disetujui untuk mendapatkan QR Code")
            }
        }
        binding.rvVehicles.layoutManager = androidx.recyclerview.widget.LinearLayoutManager(requireContext())
        binding.rvVehicles.adapter = adapter
    }

    private fun setupTabs() {
        binding.tabLayout.addOnTabSelectedListener(object : com.google.android.material.tabs.TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: com.google.android.material.tabs.TabLayout.Tab) {
                currentTab = tab.position
                updateList()
            }
            override fun onTabUnselected(tab: com.google.android.material.tabs.TabLayout.Tab?) {}
            override fun onTabReselected(tab: com.google.android.material.tabs.TabLayout.Tab?) {}
        })
    }

    private fun updateList() {
        val allVehicles = viewModel.vehicles.value ?: emptyList()
        val filteredList = if (currentTab == 0) {
            allVehicles.filter { it.registrationStatus == "approved" }
        } else {
            allVehicles.filter { it.registrationStatus != "approved" }
        }
        
        adapter.submitList(filteredList)
        
        // Don't show empty state if currently loading or there's an error
        if (viewModel.isLoading.value == true || viewModel.error.value != null) return

        if (filteredList.isEmpty()) {
            binding.layoutEmpty.visible()
            binding.rvVehicles.gone()
            binding.layoutError.gone()
            binding.layoutLoading.gone()
        } else {
            binding.layoutEmpty.gone()
            binding.rvVehicles.visible()
            binding.layoutError.gone()
            binding.layoutLoading.gone()
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setColorSchemeResources(
            R.color.primary,
            R.color.secondary,
            R.color.accent
        )
        binding.swipeRefresh.setOnRefreshListener {
            viewModel.loadVehicles()
        }
    }

    private fun observeViewModel() {
        viewModel.vehicles.observe(viewLifecycleOwner) {
            updateList()
        }

        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.swipeRefresh.isRefreshing = isLoading
            if (isLoading && viewModel.vehicles.value.isNullOrEmpty()) {
                binding.layoutLoading.visible()
                binding.layoutEmpty.gone()
                binding.layoutError.gone()
                binding.rvVehicles.gone()
            } else if (!isLoading) {
                binding.layoutLoading.gone()
                updateList() // Refresh list state after loading finishes
            }
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let { 
                showToast(it) 
                if (viewModel.vehicles.value.isNullOrEmpty()) {
                    binding.layoutError.visible()
                    binding.tvErrorMessage.text = it
                    binding.layoutEmpty.gone()
                    binding.layoutLoading.gone()
                    binding.rvVehicles.gone()
                }
            } ?: run {
                binding.layoutError.gone()
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
