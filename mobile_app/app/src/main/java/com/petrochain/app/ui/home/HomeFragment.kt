package com.petrochain.app.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private val viewModel: HomeViewModel by viewModels()

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
        observeViewModel()
        viewModel.loadVehicles()
    }

    private fun setupUI() {
        binding.tvWelcomeName.text = "Halo, ${viewModel.userName}!"

        binding.cardMyVehicles.setOnClickListener {
            requireActivity().findViewById<com.google.android.material.bottomnavigation.BottomNavigationView>(R.id.bottomNavPublic)
                ?.selectedItemId = R.id.myVehiclesFragment
        }

        binding.cardRegister.setOnClickListener {
            requireActivity().findViewById<com.google.android.material.bottomnavigation.BottomNavigationView>(R.id.bottomNavPublic)
                ?.selectedItemId = R.id.registerVehicleFragment
        }
    }

    private fun observeViewModel() {
        viewModel.vehicles.observe(viewLifecycleOwner) { vehicles ->
            binding.tvTotalVehicles.text = vehicles.size.toString()
            binding.tvPendingCount.text = vehicles.count {
                it.registrationStatus == "pending" || it.registrationStatus == "pending_review"
            }.toString()
            binding.tvApprovedCount.text = vehicles.count {
                it.registrationStatus == "approved"
            }.toString()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
