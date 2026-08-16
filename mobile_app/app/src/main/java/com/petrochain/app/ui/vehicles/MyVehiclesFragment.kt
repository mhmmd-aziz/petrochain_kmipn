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
                    "qr_code_url" to vehicle.qrCodeUrl,
                    "plate_number" to vehicle.plateNumber,
                    "brand" to (vehicle.brand ?: ""),
                    "model" to (vehicle.model ?: "")
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
        if (filteredList.isEmpty()) {
            binding.layoutEmpty.visible()
            binding.rvVehicles.gone()
        } else {
            binding.layoutEmpty.gone()
            binding.rvVehicles.visible()
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
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            error?.let { showToast(it) }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
