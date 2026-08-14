package com.petrochain.app.ui.qrcode

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import androidx.fragment.app.Fragment
import coil.load
import com.petrochain.app.databinding.FragmentQrCodeBinding

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

        binding.tvPlateNumber.text = plateNumber
        binding.tvVehicleInfo.text = "$brand $model".trim()

        if (qrCodeUrl != null) {
            binding.ivQrCode.load(qrCodeUrl) {
                crossfade(true)
                error(android.R.drawable.ic_dialog_alert)
            }
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
