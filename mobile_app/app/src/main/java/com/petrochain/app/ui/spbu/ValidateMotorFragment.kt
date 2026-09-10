package com.petrochain.app.ui.spbu

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.text.Editable
import android.text.TextWatcher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
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

        // Pastikan scroll bisa sampai ke bawah tombol, tidak ketutup navigation bar sistem
        ViewCompat.setOnApplyWindowInsetsListener(binding.root) { v, insets ->
            val navBarHeight = insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom
            v.setPadding(v.paddingLeft, v.paddingTop, v.paddingRight, navBarHeight)
            insets
        }

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

        // Smoke and Mirrors: Calculate liters from Rupiah
        binding.etNominalRupiah.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                if (s.isNullOrEmpty()) return
                // Only calculate if the user is typing in Rupiah, prevent loop
                if (binding.etNominalRupiah.hasFocus()) {
                    val nominal = s.toString().toDoubleOrNull() ?: 0.0
                    val price = if (binding.rbPertalite.isChecked) 10000.0 else 6800.0
                    if (nominal > 0) {
                        val volume = nominal / price
                        binding.etVolume.setText(String.format(Locale.US, "%.2f", volume))
                    } else {
                        binding.etVolume.setText("")
                    }
                }
            }
        })

        // Re-calculate if fuel type changes
        binding.rgFuelType.setOnCheckedChangeListener { _, _ ->
            val s = binding.etNominalRupiah.text
            if (!s.isNullOrEmpty()) {
                val nominal = s.toString().toDoubleOrNull() ?: 0.0
                val price = if (binding.rbPertalite.isChecked) 10000.0 else 6800.0
                if (nominal > 0) {
                    val volume = nominal / price
                    binding.etVolume.setText(String.format(Locale.US, "%.2f", volume))
                }
            }
        }

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
                isOverride = isOverride,
                isMotor = true
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
                        binding.tvMatchStatus.text = "VALID (UNDER 250CC)"
                        binding.tvMatchStatus.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_check, 0, 0, 0)
                        binding.tvMatchStatus.compoundDrawablePadding = 8
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

                        binding.tvMatchStatus.text = "DITOLAK (OVER 250CC)"
                        binding.tvMatchStatus.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_block, 0, 0, 0)
                        binding.tvMatchStatus.compoundDrawablePadding = 8
                        binding.tvMatchStatus.setTextColor(
                            ContextCompat.getColor(requireContext(), R.color.status_rejected)
                        )
                        binding.cardResult.setCardBackgroundColor(
                            ContextCompat.getColor(requireContext(), R.color.error_bg)
                        )
                    }
                    binding.tvDetectedPlate.text = if (data.isMatch) "Klasifikasi: Under 250cc (Valid)" else "Klasifikasi: Over 250cc (Ditolak)"
                    val confDisplay = if (data.confidence > 0) String.format("Confidence: %.1f%%", data.confidence * 100) else "Confidence: N/A"
                    binding.tvConfidence.text = confDisplay

                    val fuelLabel = if (data.fuelType?.lowercase()?.contains("solar") == true) "Biosolar" else "Pertalite"
                    binding.tvVehicleFuelType.text = "Jenis BBM Terdaftar: $fuelLabel"
                    
                    // Motor selalu Pertalite, dan opsi Solar disembunyikan
                    binding.rbPertalite.isChecked = true
                    binding.rbPertalite.visibility = View.VISIBLE
                    binding.rbSolar.visibility = View.GONE
                    
                    if (data.remainingQuota != null) {
                        val maxQuota = data.maxQuota ?: 0.0
                        if (maxQuota > 1000) {
                            binding.tvRemainingQuota.text = "Sisa Kuota: Tanpa Batas"
                        } else {
                            binding.tvRemainingQuota.text = "Sisa Kuota: ${data.remainingQuota} L (Maks $maxQuota L)"
                            if (data.remainingQuota <= 0) {
                                binding.tvRemainingQuota.setTextColor(
                                    ContextCompat.getColor(requireContext(), R.color.status_rejected)
                                )
                                binding.btnSubmitTransaction.isEnabled = false
                                binding.btnSubmitTransaction.text = "Kuota Habis"
                                binding.btnSubmitTransaction.setBackgroundColor(
                                    android.graphics.Color.GRAY
                                )
                                showToast("Kuota harian kendaraan ini sudah habis!")
                            } else {
                                binding.tvRemainingQuota.setTextColor(
                                    ContextCompat.getColor(requireContext(), R.color.status_approved)
                                )
                                binding.btnSubmitTransaction.isEnabled = true
                                binding.btnSubmitTransaction.text = "Konfirmasi Pengisian"
                            }
                        }
                    } else {
                        binding.tvRemainingQuota.text = ""
                    }
                }
                it.onFailure { error ->
                    binding.cardResult.visible()
                    binding.tvMatchStatus.text = "Gagal: ${error.message}"
                    binding.tvMatchStatus.setCompoundDrawablesWithIntrinsicBounds(R.drawable.ic_info, 0, 0, 0)
                    binding.tvMatchStatus.compoundDrawablePadding = 8
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
