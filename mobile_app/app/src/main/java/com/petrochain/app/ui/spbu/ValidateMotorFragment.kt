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
import com.petrochain.app.databinding.FragmentValidateMotorBinding
import com.petrochain.app.util.gone
import com.petrochain.app.util.showToast
import com.petrochain.app.util.visible
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ValidateMotorFragment : Fragment() {

    private var _binding: FragmentValidateMotorBinding? = null
    private val binding get() = _binding!!
    private val viewModel: SpbuViewModel by activityViewModels()

    private var vehicleId: Int = 0
    private var photoUri: Uri? = null
    private var photoFile: File? = null
    private var isOverride: Boolean = false

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
        _binding = FragmentValidateMotorBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Reset semua state saat fragment dibuka agar tidak menampilkan hasil validasi sebelumnya
        viewModel.clearResults()
        binding.cardResult.gone()
        binding.cardTransaction.gone()
        binding.btnOverride.gone()
        binding.btnValidate.isEnabled = false

        binding.cardCapturePhoto.setOnClickListener {
            checkCameraAndLaunch()
        }

        binding.btnValidate.setOnClickListener {
            photoFile?.let { photo ->
                viewModel.validateMotor(photo)
            } ?: showToast("Ambil foto plat nomor terlebih dahulu")
        }

        observeViewModel()

        binding.btnSubmitTransaction.setOnClickListener {
            val volumeStr = binding.etVolume.text.toString()
            val volume = volumeStr.toDoubleOrNull()
            
            if (volume == null || volume <= 0) {
                showToast("Masukkan volume yang valid")
                return@setOnClickListener
            }

            val fuelType = if (binding.rbPertalite.isChecked) "pertalite" else "solar"
            
            val plateResultText = binding.tvDetectedPlate.text.toString().replace("Plat Terdeteksi: ", "")
            val plateResult = if (plateResultText.isNotBlank() && plateResultText != "-") plateResultText else null
            
            // Get confidence from UI (extract number)
            val confStr = binding.tvConfidence.text.toString().replace(Regex("[^0-9.]"), "")
            val conf = confStr.toDoubleOrNull()?.div(100.0)

            // Motor uses "no_qr" because there is no QR flow
            val request = com.petrochain.app.data.model.SubmitTransactionRequest(
                vehicleId = null,
                fuelType = fuelType,
                volume = volume,
                qrResult = "no_qr",
                plateResult = plateResult,
                plateConfidence = conf,
                isOverride = isOverride
            )

            viewModel.submitTransaction(request)
        }
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.btnValidate.isEnabled = !isLoading && photoFile != null
            binding.btnValidate.text = if (isLoading) "Memvalidasi..." else "Validasi Kendaraan"
            binding.btnSubmitTransaction.isEnabled = !isLoading
            binding.btnSubmitTransaction.text = if (isLoading) "Memproses..." else "Simpan Transaksi & Potong Kuota"
            if (isLoading) binding.progressBar.visible() else binding.progressBar.gone()
        }

        viewModel.vehicleResult.observe(viewLifecycleOwner) { result ->
            result?.let {
                binding.cardResult.visible()
                it.onSuccess { data ->
                    // For motor, we consider it a success if capacity is UNDER_250CC (not a luxury motorcycle)
                    // Or if the AI mock says it's a match (if data.isMatch is reused for Under/Over)
                    // Let's assume if data.isMatch == true, it's UNDER_250CC
                    if (data.isMatch) {
                        binding.cardTransaction.visible()
                        binding.btnOverride.gone()
                        binding.tvMatchStatus.text = "✅ VALID (UNDER 250CC)"
                        binding.tvMatchStatus.setTextColor(
                            ContextCompat.getColor(requireContext(), R.color.status_approved)
                        )
                        binding.cardResult.setCardBackgroundColor(
                            ContextCompat.getColor(requireContext(), R.color.success_bg)
                        )
                    } else {
                        binding.cardTransaction.gone() // Hide transaction block initially
                        binding.btnOverride.visible()
                        
                        binding.btnOverride.setOnClickListener {
                            isOverride = true
                            binding.cardTransaction.visible()
                            binding.btnOverride.gone()
                        }

                        binding.tvMatchStatus.text = "❌ DITOLAK (OVER 250CC)"
                        binding.tvMatchStatus.setTextColor(
                            ContextCompat.getColor(requireContext(), R.color.status_rejected)
                        )
                        binding.cardResult.setCardBackgroundColor(
                            ContextCompat.getColor(requireContext(), R.color.error_bg)
                        )
                    }
                    binding.tvDetectedPlate.text = if (data.isMatch) "Klasifikasi: ✅ Under 250cc" else "Klasifikasi: ❌ Over 250cc"
                    val confDisplay = if ((data.confidence ?: 0.0) > 0) String.format("Confidence: %.1f%%", (data.confidence ?: 0.0) * 100) else "Confidence: N/A"
                    binding.tvConfidence.text = confDisplay
                }
                it.onFailure { error ->
                    binding.tvMatchStatus.text = "⚠️ Gagal: ${error.message}"
                    binding.tvMatchStatus.setTextColor(
                        ContextCompat.getColor(requireContext(), R.color.status_rejected)
                    )
                    binding.tvDetectedPlate.text = ""
                    binding.tvConfidence.text = ""
                }
            }
        }

        viewModel.transactionResult.observe(viewLifecycleOwner) { result ->
            result?.let {
                it.onSuccess { data ->
                    showToast("Transaksi Berhasil!")
                    viewModel.clearResults()
                    requireActivity().onBackPressedDispatcher.onBackPressed() // Go back
                }
                it.onFailure { error ->
                    showToast(error.message ?: "Gagal memproses transaksi")
                }
            }
        }
    }

    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            photoUri = uri
            photoFile = uriToFile(uri)
            if (photoFile != null) {
                binding.ivVehiclePhoto.setImageURI(uri)
                binding.ivVehiclePhoto.visible()
                binding.tvPhotoPlaceholder.gone()
                binding.btnValidate.isEnabled = true
            } else {
                showToast("Gagal memuat gambar dari galeri")
            }
        }
    }

    private fun uriToFile(uri: Uri): File? {
        return try {
            val inputStream = requireContext().contentResolver.openInputStream(uri)
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val tempFile = File.createTempFile("GALLERY_${timeStamp}", ".jpg", requireContext().cacheDir)
            tempFile.outputStream().use { output ->
                inputStream?.copyTo(output)
            }
            tempFile
        } catch (e: Exception) {
            null
        }
    }

    private fun checkCameraAndLaunch() {
        val options = arrayOf("Ambil Foto (Kamera)", "Pilih dari Galeri")
        com.google.android.material.dialog.MaterialAlertDialogBuilder(requireContext())
            .setTitle("Sumber Foto Plat Nomor")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> {
                        when {
                            ContextCompat.checkSelfPermission(
                                requireContext(), Manifest.permission.CAMERA
                            ) == PackageManager.PERMISSION_GRANTED -> launchCamera()
                            else -> requestPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    }
                    1 -> {
                        pickImageLauncher.launch("image/*")
                    }
                }
            }
            .show()
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
