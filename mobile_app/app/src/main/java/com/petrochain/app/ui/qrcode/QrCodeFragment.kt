package com.petrochain.app.ui.qrcode

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import coil.load
import com.petrochain.app.databinding.FragmentQrCodeBinding
import com.petrochain.app.data.api.RetrofitClient

/**
 * Displays the QR Code for an approved vehicle at full screen.
 * Automatically increases screen brightness for easy scanning.
 */
class QrCodeFragment : Fragment() {

    private var _binding: FragmentQrCodeBinding? = null
    private val binding get() = _binding!!
    private var previousBrightness: Float = -1f

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentQrCodeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val qrCodeUrl = arguments?.getString("qr_code_url")
        val plateNumber = arguments?.getString("plate_number") ?: ""
        val brand = arguments?.getString("brand") ?: ""
        val model = arguments?.getString("model") ?: ""
        val vehicleType = arguments?.getString("vehicle_type") ?: "mobil_pribadi"

        binding.tvPlateNumber.text = plateNumber
        binding.tvVehicleInfo.text = "$brand $model".trim()

        val vehicleId = arguments?.getInt("vehicle_id") ?: 0
        if (vehicleId > 0) {
            binding.tvQuota.text = "Memuat kuota..."
            viewLifecycleOwner.lifecycleScope.launch {
                try {
                    val response = RetrofitClient.apiService.checkQuota(vehicleId)
                    if (response.isSuccessful) {
                        val quotaData = response.body()
                        if (quotaData != null) {
                            if (quotaData.maxQuota > 1000) {
                                binding.tvQuota.text = "Sisa Kuota Hari Ini: Tanpa Batas"
                            } else {
                                binding.tvQuota.text = "Sisa Kuota Hari Ini: ${quotaData.remainingQuota} L"
                            }
                        }
                    } else {
                        binding.tvQuota.text = "Gagal memuat kuota"
                    }
                } catch (e: Exception) {
                    binding.tvQuota.text = "Gagal memuat kuota"
                }
            }
        } else {
            val quota = when (vehicleType) {
                "motor" -> 9999
                "angkutan_umum" -> 80
                "angkutan_barang" -> 200
                else -> 50 // mobil_pribadi
            }
            
            if (quota > 1000) {
                binding.tvQuota.text = "Sisa Kuota Hari Ini: Tanpa Batas"
            } else {
                binding.tvQuota.text = "Sisa Kuota Hari Ini: $quota L"
            }
        }

        binding.btnBack.setOnClickListener {
            findNavController().navigateUp()
        }

        if (qrCodeUrl != null) {
            binding.ivQrCode.load(qrCodeUrl) {
                crossfade(true)
                allowHardware(false)
                error(android.R.drawable.ic_dialog_alert)
            }
            binding.btnDownloadQr.visibility = View.VISIBLE
            binding.btnDownloadQr.setOnClickListener {
                downloadQrCode(plateNumber)
            }
        } else {
            binding.btnDownloadQr.visibility = View.GONE
        }

        // Increase brightness for QR scanning
        setBrightness(1.0f)
    }

    private fun setBrightness(brightness: Float) {
        activity?.window?.let { window ->
            val layoutParams = window.attributes
            previousBrightness = layoutParams.screenBrightness
            layoutParams.screenBrightness = brightness
            window.attributes = layoutParams
        }
    }

    private fun downloadQrCode(plateNumber: String) {
        try {
            val view = binding.exportableArea
            // Ensure the view is laid out before capturing
            if (view.width == 0 || view.height == 0) {
                android.widget.Toast.makeText(requireContext(), "Menunggu tampilan siap...", android.widget.Toast.LENGTH_SHORT).show()
                return
            }

            val bitmap = android.graphics.Bitmap.createBitmap(view.width, view.height, android.graphics.Bitmap.Config.ARGB_8888)
            val canvas = android.graphics.Canvas(bitmap)
            // Ensure the blue background is drawn even if the LinearLayout assumes a transparent background on some devices
            canvas.drawColor(android.graphics.Color.parseColor("#980F12")) // Primary color
            view.draw(canvas)

            val filename = "Kartu_QR_${System.currentTimeMillis()}_$plateNumber.png"
            val contentValues = android.content.ContentValues().apply {
                put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, filename)
                put(android.provider.MediaStore.MediaColumns.MIME_TYPE, "image/png")
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, android.os.Environment.DIRECTORY_PICTURES + "/Petrochain")
                }
            }

            val uri = requireContext().contentResolver.insert(android.provider.MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
            if (uri != null) {
                requireContext().contentResolver.openOutputStream(uri).use { outputStream ->
                    if (outputStream != null) {
                        bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, outputStream)
                    }
                }
                android.widget.Toast.makeText(requireContext(), "Kartu QR Code berhasil disimpan ke Galeri (Pictures/Petrochain)!", android.widget.Toast.LENGTH_LONG).show()
            } else {
                android.widget.Toast.makeText(requireContext(), "Gagal menyimpan gambar", android.widget.Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            android.widget.Toast.makeText(requireContext(), "Gagal menyimpan: ${e.message}", android.widget.Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        // Restore original brightness
        if (previousBrightness >= 0) {
            setBrightness(previousBrightness)
        } else {
            setBrightness(WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE)
        }
        super.onDestroyView()
        _binding = null
    }
}
