package com.petrochain.app.ui.vehicles

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
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
            binding.tvPlateNumber.text = vehicle.plateNumber
            binding.tvVehicleInfo.text = buildString {
                append(vehicle.brand ?: "")
                if (vehicle.model != null) append(" ${vehicle.model}")
            }
            binding.tvVehicleType.text = when (vehicle.vehicleType) {
                "car" -> "Mobil"
                "motorcycle" -> "Motor"
                "truck" -> "Truk"
                "bus" -> "Bus"
                else -> vehicle.vehicleType
            }

            // Status chip
            val context = binding.root.context
            when (vehicle.registrationStatus) {
                "approved" -> {
                    binding.chipStatus.text = "Disetujui"
                    binding.chipStatus.setChipBackgroundColorResource(R.color.status_approved)
                    binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    binding.btnShowQr.visible()
                }
                "pending", "pending_review", "ocr_processing" -> {
                    binding.chipStatus.text = "Menunggu"
                    binding.chipStatus.setChipBackgroundColorResource(R.color.status_pending)
                    binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    binding.btnShowQr.gone()
                }
                "rejected" -> {
                    binding.chipStatus.text = "Ditolak"
                    binding.chipStatus.setChipBackgroundColorResource(R.color.status_rejected)
                    binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    binding.btnShowQr.gone()
                }
                else -> {
                    binding.chipStatus.text = "Belum Terdaftar"
                    binding.chipStatus.setChipBackgroundColorResource(R.color.gray_400)
                    binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    binding.btnShowQr.gone()
                }
            }

            // Admin notes
            if (!vehicle.adminNotes.isNullOrBlank()) {
                binding.tvAdminNotes.visible()
                binding.tvAdminNotes.text = "Catatan: ${vehicle.adminNotes}"
            } else {
                binding.tvAdminNotes.gone()
            }

            binding.btnShowQr.setOnClickListener {
                onQrClick(vehicle)
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
