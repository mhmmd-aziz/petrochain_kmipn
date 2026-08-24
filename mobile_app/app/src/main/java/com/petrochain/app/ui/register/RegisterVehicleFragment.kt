package com.petrochain.app.ui.register

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentRegisterVehicleBinding
import com.petrochain.app.util.gone
import com.petrochain.app.util.showToast
import com.petrochain.app.util.visible
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class RegisterVehicleFragment : Fragment() {

    private var _binding: FragmentRegisterVehicleBinding? = null
    private val binding get() = _binding!!
    private val viewModel: RegisterVehicleViewModel by viewModels()

    private var currentPhotoUri: Uri? = null
    private var currentPhotoType: PhotoType? = null

    private enum class PhotoType { STNK, CAR }

    // Camera permission launcher
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            currentPhotoType?.let { launchCamera(it) }
        } else {
            showToast("Izin kamera diperlukan untuk mengambil foto")
        }
    }

    // Camera capture launcher
    private val takePictureLauncher = registerForActivityResult(
        ActivityResultContracts.TakePicture()
    ) { success ->
        if (success && currentPhotoUri != null) {
            handleImageSelected(currentPhotoUri!!)
        }
    }

    // Gallery picker launcher
    private val pickImageLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            handleImageSelected(uri)
        }
    }

    private fun handleImageSelected(uri: Uri) {
        when (currentPhotoType) {
            PhotoType.STNK -> {
                binding.ivStnkPreview.setImageURI(uri)
                binding.ivStnkPreview.visible()
                binding.tvStnkPlaceholder.gone()
                viewModel.stnkImageFile = uriToFile(uri)
            }
            PhotoType.CAR -> {
                binding.ivCarPreview.setImageURI(uri)
                binding.ivCarPreview.visible()
                binding.tvCarPlaceholder.gone()
                viewModel.carImageFile = uriToFile(uri)
            }
            null -> {}
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentRegisterVehicleBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupUI()
        observeViewModel()
    }

    private fun setupUI() {

        // Fuel type dropdown
        val fuelTypes = arrayOf("Pertalite", "Bio Solar")
        val fuelAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, fuelTypes)
        binding.actvFuelType.setAdapter(fuelAdapter)

        // Vehicle type dropdown
        val vehicleTypes = arrayOf("Mobil / Kendaraan Pribadi", "Bus / Angkutan Umum", "Truk / Angkutan Barang")
        val vehicleTypeAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, vehicleTypes)
        binding.actvVehicleType.setAdapter(vehicleTypeAdapter)

        // Region code dropdown (Prefix Pelat)
        val regionCodes = arrayOf(
            "BL", "B", "D", "E", "F", "T", "Z", "A", "G", "H", "K", "R", "AA", "AB", "AD", "AE", "AG",
            "S", "W", "L", "M", "N", "P", "DK", "DR", "EA", "DH", "EB", "ED", "KB", "DA", "KH", "KT", "KU",
            "DB", "DL", "DM", "DN", "DT", "DD", "DP", "DW", "PA", "PB"
        )
        val regionAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, regionCodes)
        binding.actvPlatePrefix.setAdapter(regionAdapter)

        // Camera / Gallery buttons
        binding.cardStnk.setOnClickListener {
            showImageSourceDialog(PhotoType.STNK)
        }

        binding.cardCar.setOnClickListener {
            showImageSourceDialog(PhotoType.CAR)
        }

        // Submit button
        binding.btnSubmit.setOnClickListener {
            val prefix = binding.actvPlatePrefix.text.toString().trim().uppercase()
            val core = binding.etPlateNumberCore.text.toString().trim()
            val suffix = binding.etPlateSuffix.text.toString().trim().uppercase()
            val plateNumber = "$prefix $core $suffix".trim()
            
            val vehicleTypeRaw = binding.actvVehicleType.text.toString().trim()
            val vehicleType = when (vehicleTypeRaw) {
                "Mobil / Kendaraan Pribadi" -> "mobil_pribadi"
                "Bus / Angkutan Umum" -> "angkutan_umum"
                "Truk / Angkutan Barang" -> "angkutan_barang"
                else -> ""
            }

            val brand = binding.etBrand.text.toString().trim()
            val model = binding.etModel.text.toString().trim()
            val engineCapacity = binding.etEngineCapacity.text.toString().trim()
            val fuelType = binding.actvFuelType.text.toString().trim()

            // Validation
            var isValid = true
            if (core.isEmpty() || prefix.isEmpty()) {
                binding.tilPlateNumberCore.error = "Plat tidak lengkap"
                isValid = false
            } else binding.tilPlateNumberCore.error = null

            if (vehicleType.isEmpty()) {
                binding.tilVehicleType.error = "Pilih tipe kendaraan"
                isValid = false
            } else binding.tilVehicleType.error = null


            if (brand.isEmpty()) {
                binding.tilBrand.error = "Merek wajib diisi"
                isValid = false
            } else binding.tilBrand.error = null

            if (model.isEmpty()) {
                binding.tilModel.error = "Model wajib diisi"
                isValid = false
            } else binding.tilModel.error = null

            if (engineCapacity.isEmpty()) {
                binding.tilEngineCapacity.error = "CC wajib diisi"
                isValid = false
            } else binding.tilEngineCapacity.error = null

            if (fuelType.isEmpty()) {
                binding.tilFuelType.error = "Pilih tipe bensin"
                isValid = false
            } else binding.tilFuelType.error = null


            if (viewModel.stnkImageFile == null) {
                showToast("Ambil foto STNK terlebih dahulu")
                isValid = false
            }

            if (viewModel.carImageFile == null) {
                showToast("Ambil foto kendaraan terlebih dahulu")
                isValid = false
            }

            if (isValid) {
                viewModel.registerVehicle(plateNumber, vehicleType, brand, model, engineCapacity, fuelType)
            }
        }
    }

    private fun observeViewModel() {
        viewModel.isLoading.observe(viewLifecycleOwner) { isLoading ->
            binding.btnSubmit.isEnabled = !isLoading
            binding.btnSubmit.text = if (isLoading) "Mengirim..." else "Daftarkan Kendaraan"
            if (isLoading) binding.progressBar.visible() else binding.progressBar.gone()
        }

        viewModel.registerResult.observe(viewLifecycleOwner) { result ->
            result.onSuccess {
                showToast("Pendaftaran berhasil! Menunggu verifikasi admin.")
                findNavController().navigateUp()
            }
            result.onFailure { error ->
                val message = error.message ?: "Pendaftaran gagal"
                // Show a more prominent dialog for document validation errors
                if (message.contains("STNK", ignoreCase = true) || 
                    message.contains("Motor", ignoreCase = true) ||
                    message.contains("bukan", ignoreCase = true) ||
                    message.contains("dokumen", ignoreCase = true)) {
                    android.app.AlertDialog.Builder(requireContext())
                        .setTitle("⚠️ Dokumen Tidak Valid")
                        .setMessage(message)
                        .setPositiveButton("Ganti Dokumen") { dialog, _ ->
                            dialog.dismiss()
                            // Reset STNK image so user re-uploads
                            viewModel.stnkImageFile = null
                            binding.ivStnkPreview.setImageResource(android.R.drawable.ic_menu_gallery)
                        }
                        .setNegativeButton("Batal", null)
                        .show()
                } else {
                    showToast(message)
                }
            }
        }
    }

    private fun showImageSourceDialog(type: PhotoType) {
        val options = arrayOf("Ambil dari Kamera", "Pilih dari Galeri")
        android.app.AlertDialog.Builder(requireContext())
            .setTitle("Pilih Sumber Foto")
            .setItems(options) { _, which ->
                when (which) {
                    0 -> {
                        currentPhotoType = type
                        checkCameraPermissionAndLaunch(type)
                    }
                    1 -> {
                        currentPhotoType = type
                        pickImageLauncher.launch("image/*")
                    }
                }
            }
            .show()
    }

    private fun checkCameraPermissionAndLaunch(type: PhotoType) {
        when {
            ContextCompat.checkSelfPermission(
                requireContext(), Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                launchCamera(type)
            }
            else -> {
                requestPermissionLauncher.launch(Manifest.permission.CAMERA)
            }
        }
    }

    private fun launchCamera(type: PhotoType) {
        val photoFile = createImageFile(type)
        currentPhotoUri = FileProvider.getUriForFile(
            requireContext(),
            "${requireContext().packageName}.fileprovider",
            photoFile
        )
        takePictureLauncher.launch(currentPhotoUri)
    }

    private fun createImageFile(type: PhotoType): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val prefix = if (type == PhotoType.STNK) "STNK" else "CAR"
        val fileName = "${prefix}_${timeStamp}"
        val storageDir = requireContext().cacheDir
        return File.createTempFile(fileName, ".jpg", storageDir)
    }

    private fun uriToFile(uri: Uri): File? {
        return try {
            val inputStream = requireContext().contentResolver.openInputStream(uri) ?: return null
            val tempFile = File.createTempFile("upload_", ".jpg", requireContext().cacheDir)
            tempFile.outputStream().use { output ->
                inputStream.copyTo(output)
            }
            tempFile
        } catch (e: Exception) {
            null
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
