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
            when (currentPhotoType) {
                PhotoType.STNK -> {
                    binding.ivStnkPreview.setImageURI(currentPhotoUri)
                    binding.ivStnkPreview.visible()
                    binding.tvStnkPlaceholder.gone()
                    viewModel.stnkImageFile = uriToFile(currentPhotoUri!!)
                }
                PhotoType.CAR -> {
                    binding.ivCarPreview.setImageURI(currentPhotoUri)
                    binding.ivCarPreview.visible()
                    binding.tvCarPlaceholder.gone()
                    viewModel.carImageFile = uriToFile(currentPhotoUri!!)
                }
                null -> {}
            }
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
        // Vehicle type dropdown
        val types = arrayOf("Motor", "Mobil")
        val typeValues = arrayOf("motorcycle", "car")
        val adapter = ArrayAdapter(requireContext(), android.R.layout.simple_dropdown_item_1line, types)
        binding.spinnerVehicleType.setAdapter(adapter)

        // Camera buttons
        binding.cardStnk.setOnClickListener {
            currentPhotoType = PhotoType.STNK
            checkCameraPermissionAndLaunch(PhotoType.STNK)
        }

        binding.cardCar.setOnClickListener {
            currentPhotoType = PhotoType.CAR
            checkCameraPermissionAndLaunch(PhotoType.CAR)
        }

        // Submit button
        binding.btnSubmit.setOnClickListener {
            val plateNumber = binding.etPlateNumber.text.toString().trim().uppercase()
            val typeIndex = types.indexOf(binding.spinnerVehicleType.text.toString())
            val vehicleType = if (typeIndex >= 0) typeValues[typeIndex] else ""
            val brand = binding.etBrand.text.toString().trim()
            val model = binding.etModel.text.toString().trim()

            // Validation
            var isValid = true
            if (plateNumber.isEmpty()) {
                binding.tilPlateNumber.error = "Nomor plat wajib diisi"
                isValid = false
            } else binding.tilPlateNumber.error = null

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

            if (viewModel.stnkImageFile == null) {
                showToast("Ambil foto STNK terlebih dahulu")
                isValid = false
            }

            if (viewModel.carImageFile == null) {
                showToast("Ambil foto kendaraan terlebih dahulu")
                isValid = false
            }

            if (isValid) {
                viewModel.registerVehicle(plateNumber, vehicleType, brand, model)
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
            result.onFailure {
                showToast(it.message ?: "Pendaftaran gagal")
            }
        }
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
