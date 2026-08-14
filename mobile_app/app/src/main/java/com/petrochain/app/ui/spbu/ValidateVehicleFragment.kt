package com.petrochain.app.ui.spbu

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentValidateVehicleBinding
import com.petrochain.app.util.gone
import com.petrochain.app.util.showToast
import com.petrochain.app.util.visible
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ValidateVehicleFragment : Fragment() {

    private var _binding: FragmentValidateVehicleBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SpbuViewModel by activityViewModels()

    private var vehicleId: Int = 0
    private var photoUri: Uri? = null
    private var photoFile: File? = null

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) launchCamera()
        else showToast("Izin kamera diperlukan")
    }

    private val takePictureLauncher = registerForActivityResult(
        ActivityResultContracts.TakePicture()
    ) { success ->
        if (success && photoUri != null) {
            binding.ivVehiclePhoto.setImageURI(photoUri)
            binding.ivVehiclePhoto.visible()
            binding.tvPhotoPlaceholder.gone()
            binding.btnValidate.isEnabled = true
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentValidateVehicleBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        vehicleId = arguments?.getInt("vehicle_id") ?: 0
        val plateNumber = arguments?.getString("plate_number") ?: ""
        val brand = arguments?.getString("brand") ?: ""
        val model = arguments?.getString("model") ?: ""

        binding.tvRegisteredPlate.text = plateNumber
        binding.tvRegisteredVehicle.text = "$brand $model".trim()

        binding.cardCapturePhoto.setOnClickListener {
            checkCameraAndLaunch()
        }

        binding.btnValidate.setOnClickListener {
            photoFile?.let { file ->
                viewModel.validateVehicle(vehicleId, file)
            } ?: showToast("Ambil foto plat nomor terlebih dahulu")
        }

        observeViewModel()
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.btnValidate.isEnabled = !isLoading && photoFile != null
            binding.btnValidate.text = if (isLoading) "Memvalidasi..." else "Validasi Kendaraan"
            if (isLoading) binding.progressBar.visible() else binding.progressBar.gone()
        }

        viewModel.vehicleResult.observe(viewLifecycleOwner) { result ->
            result?.let {
                binding.cardResult.visible()
                it.onSuccess { data ->
                    if (data.isMatch) {
                        binding.tvMatchStatus.text = "✅ COCOK (MATCH)"
                        binding.tvMatchStatus.setTextColor(
                            ContextCompat.getColor(requireContext(), R.color.status_approved)
                        )
                        binding.cardResult.setCardBackgroundColor(
                            ContextCompat.getColor(requireContext(), R.color.success_bg)
                        )
                    } else {
                        binding.tvMatchStatus.text = "❌ TIDAK COCOK (MISMATCH)"
                        binding.tvMatchStatus.setTextColor(
                            ContextCompat.getColor(requireContext(), R.color.status_rejected)
                        )
                        binding.cardResult.setCardBackgroundColor(
                            ContextCompat.getColor(requireContext(), R.color.error_bg)
                        )
                    }
                    binding.tvDetectedPlate.text = "Plat Terdeteksi: ${data.detectedPlate ?: "-"}"
                    binding.tvRegisteredPlateResult.text = "Plat Terdaftar: ${data.registeredPlate}"
                    binding.tvConfidence.text = "Confidence: ${String.format("%.1f", data.confidence * 100)}%"
                }
                it.onFailure { error ->
                    binding.tvMatchStatus.text = "⚠️ Gagal: ${error.message}"
                    binding.tvMatchStatus.setTextColor(
                        ContextCompat.getColor(requireContext(), R.color.status_rejected)
                    )
                    binding.tvDetectedPlate.text = ""
                    binding.tvRegisteredPlateResult.text = ""
                    binding.tvConfidence.text = ""
                }
            }
        }
    }

    private fun checkCameraAndLaunch() {
        when {
            ContextCompat.checkSelfPermission(
                requireContext(), Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> launchCamera()
            else -> requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun launchCamera() {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        photoFile = File.createTempFile("PLATE_${timeStamp}", ".jpg", requireContext().cacheDir)
        photoUri = FileProvider.getUriForFile(
            requireContext(),
            "${requireContext().packageName}.fileprovider",
            photoFile!!
        )
        takePictureLauncher.launch(photoUri)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
