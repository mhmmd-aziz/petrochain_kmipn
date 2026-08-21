package com.petrochain.app.ui.spbu

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import com.google.zxing.ResultPoint
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentScanQrBinding
import com.petrochain.app.util.gone
import com.petrochain.app.util.showToast
import com.petrochain.app.util.visible

class ScanQrFragment : Fragment() {

    private var _binding: FragmentScanQrBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SpbuViewModel by activityViewModels()
    private var isScanning = true

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startScanner()
        } else {
            showToast("Izin kamera diperlukan untuk scan QR Code")
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentScanQrBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel.clearResults()
        checkCameraPermission()
        observeViewModel()

        binding.btnScanAgain.setOnClickListener {
            binding.layoutResult.gone()
            isScanning = true
            binding.barcodeScanner.resume()
            binding.barcodeScanner.decodeContinuous(barcodeCallback)
        }

        binding.btnValidateVehicle.setOnClickListener {
            viewModel.currentQrData?.let { data ->
                val bundle = bundleOf(
                    "vehicle_id" to data.vehicleId,
                    "plate_number" to data.plateNumber,
                    "brand" to (data.brand ?: ""),
                    "model" to (data.model ?: "")
                )
                findNavController().navigate(R.id.validateVehicleFragment, bundle)
            }
        }

        binding.btnNoQr.setOnClickListener {
            val bundle = bundleOf(
                "vehicle_id" to 0,
                "plate_number" to "TANPA QR",
                "brand" to "Pelanggan",
                "model" to "Non-Subsidi Terdaftar"
            )
            findNavController().navigate(R.id.validateVehicleFragment, bundle)
        }
    }

    private val barcodeCallback = object : BarcodeCallback {
        override fun barcodeResult(result: BarcodeResult?) {
            if (!isScanning) return
            result?.text?.let { qrCode ->
                isScanning = false
                binding.barcodeScanner.pause()
                viewModel.validateQr(qrCode)
            }
        }

        override fun possibleResultPoints(resultPoints: MutableList<ResultPoint>?) {}
    }

    private fun checkCameraPermission() {
        when {
            ContextCompat.checkSelfPermission(
                requireContext(), Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                startScanner()
            }
            else -> {
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun startScanner() {
        binding.barcodeScanner.decodeContinuous(barcodeCallback)
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            if (isLoading) binding.progressBar.visible() else binding.progressBar.gone()
        }

        viewModel.qrResult.observe(viewLifecycleOwner) { result ->
            result?.let {
                binding.layoutResult.visible()
                it.onSuccess { data ->
                    binding.tvResultStatus.text = "✅ QR Code Valid"
                    binding.tvResultStatus.setTextColor(
                        ContextCompat.getColor(requireContext(), R.color.status_approved)
                    )
                    binding.tvResultPlate.text = "Plat: ${data.plateNumber}"
                    binding.tvResultVehicle.text = "${data.brand ?: ""} ${data.model ?: ""}".trim()
                    binding.tvResultType.text = "Tipe: ${data.vehicleType}"
                    binding.btnValidateVehicle.visible()
                }
                it.onFailure { error ->
                    binding.tvResultStatus.text = "❌ ${error.message}"
                    binding.tvResultStatus.setTextColor(
                        ContextCompat.getColor(requireContext(), R.color.status_rejected)
                    )
                    binding.tvResultPlate.text = ""
                    binding.tvResultVehicle.text = ""
                    binding.tvResultType.text = ""
                    binding.btnValidateVehicle.gone()
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        binding.barcodeScanner.resume()
    }

    override fun onPause() {
        super.onPause()
        binding.barcodeScanner.pause()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
