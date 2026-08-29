package com.petrochain.app.ui.spbu

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentSpbuDashboardBinding
import com.petrochain.app.util.TokenManager

class SpbuDashboardFragment : Fragment() {

    private var _binding: FragmentSpbuDashboardBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSpbuDashboardBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvWelcomeName.text = "Halo, ${TokenManager.getUserName()}!"

        binding.cardScanQr.setOnClickListener {
            findNavController().navigate(R.id.scanQrFragment)
        }

        binding.cardScanMotor.setOnClickListener {
            findNavController().navigate(R.id.validateMotorFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
