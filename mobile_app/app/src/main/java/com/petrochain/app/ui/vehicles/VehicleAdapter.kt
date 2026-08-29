package com.petrochain.app.ui.vehicles

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.petrochain.app.R
import com.petrochain.app.data.model.VehicleData
import com.petrochain.app.databinding.ItemVehicleBinding
import com.petrochain.app.util.gone
import com.petrochain.app.util.visible

class VehicleAdapter(
    private val onQrClick: (VehicleData) -> Unit
) : ListAdapter<VehicleData, VehicleAdapter.VehicleViewHolder>(VehicleDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VehicleViewHolder {
        val binding = ItemVehicleBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return VehicleViewHolder(binding)
    }

    override fun onBindViewHolder(holder: VehicleViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class VehicleViewHolder(
        private val binding: ItemVehicleBinding
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(vehicle: VehicleData) {
            val isApproved = vehicle.registrationStatus == "approved"
            
            val vehicleName = buildString {
                append(vehicle.brand ?: "")
                if (vehicle.model != null) append(" ${vehicle.model}")
            }.trim().ifEmpty { "Kendaraan Anda" }

            binding.tvVehicleName.text = vehicleName
            binding.tvPlateNumber.text = vehicle.plateNumber

            // Handle Thumbnail Image
            if (!vehicle.carImageUrl.isNullOrEmpty()) {
                binding.ivCarImage.setPadding(0, 0, 0, 0)
                binding.ivCarImage.setColorFilter(null) // clear tint
                binding.ivCarImage.load(vehicle.carImageUrl) {
                    crossfade(true)
                    placeholder(R.drawable.bg_placeholder)
                }
            } else {
                binding.ivCarImage.setPadding(32, 32, 32, 32)
                binding.ivCarImage.setImageResource(R.drawable.ic_car)
                binding.ivCarImage.setColorFilter(android.graphics.Color.parseColor("#9CA3AF"))
            }

            // Handle Status Badge
            val statusText: String
            val colorRes: Int
            val iconRes: Int
            
            when (vehicle.registrationStatus) {
                "approved" -> {
                    statusText = "Disetujui"
                    colorRes = android.graphics.Color.parseColor("#10B981") // Green
                    iconRes = R.drawable.ic_check
                    binding.ivQrAction.visible()
                }
                "pending", "pending_review", "ocr_processing" -> {
                    statusText = "Menunggu Verifikasi"
                    colorRes = android.graphics.Color.parseColor("#F59E0B") // Amber
                    iconRes = R.drawable.ic_info
                    binding.ivQrAction.gone()
                }
                "rejected" -> {
                    statusText = "Ditolak Admin"
                    colorRes = android.graphics.Color.parseColor("#EF4444") // Red
                    iconRes = R.drawable.ic_block
                    binding.ivQrAction.gone()
                }
                else -> {
                    statusText = "Tidak Terdaftar"
                    colorRes = android.graphics.Color.parseColor("#6B7280") // Gray
                    iconRes = R.drawable.ic_info
                    binding.ivQrAction.gone()
                }
            }

            binding.tvStatusText.text = statusText
            binding.tvStatusText.setTextColor(colorRes)
            binding.ivStatusDot.setImageResource(iconRes)
            binding.ivStatusDot.setColorFilter(colorRes)

            val bg = android.graphics.drawable.GradientDrawable()
            bg.shape = android.graphics.drawable.GradientDrawable.RECTANGLE
            bg.cornerRadius = 40f
            bg.setColor(android.graphics.Color.WHITE)
            bg.setStroke(3, colorRes)
            binding.layoutStatus.background = bg

            // Handle Admin Notes
            if (!vehicle.adminNotes.isNullOrBlank() && vehicle.registrationStatus == "rejected") {
                binding.tvAdminNotes.visible()
                binding.tvAdminNotes.text = "Alasan: ${vehicle.adminNotes}"
            } else {
                binding.tvAdminNotes.gone()
            }

            // Click listener
            binding.root.setOnClickListener {
                if (isApproved) {
                    onQrClick(vehicle)
                }
            }
        }
    }

    class VehicleDiffCallback : DiffUtil.ItemCallback<VehicleData>() {
        override fun areItemsTheSame(oldItem: VehicleData, newItem: VehicleData): Boolean {
            return oldItem.id == newItem.id
        }
        override fun areContentsTheSame(oldItem: VehicleData, newItem: VehicleData): Boolean {
            return oldItem == newItem
        }
    }
}
