package com.petrochain.app.ui.vehicles

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
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
            val hasImage = !vehicle.carImageUrl.isNullOrEmpty()

            val vehicleName = buildString {
                append(vehicle.brand ?: "")
                if (vehicle.model != null) append(" ${vehicle.model}")
            }.trim().ifEmpty { "Kendaraan" }

            if (isApproved && hasImage) {
                // Show large image card layout
                binding.layoutApproved.visible()
                binding.layoutSimple.gone()
                
                binding.tvApprovedTitle.text = vehicleName
                binding.tvApprovedSubtitle.text = vehicle.plateNumber
                
                binding.ivCarBackground.load(vehicle.carImageUrl) {
                    crossfade(true)
                }

                binding.root.setOnClickListener {
                    onQrClick(vehicle)
                }
            } else {
                // Show simple list layout
                binding.layoutApproved.gone()
                binding.layoutSimple.visible()

                binding.tvSimpleTitle.text = vehicleName
                binding.tvSimpleSubtitle.text = vehicle.plateNumber

                val context = binding.root.context
                when (vehicle.registrationStatus) {
                    "approved" -> {
                        binding.chipStatus.text = "Disetujui"
                        binding.chipStatus.setChipBackgroundColorResource(R.color.status_approved)
                        binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    }
                    "pending", "pending_review", "ocr_processing" -> {
                        binding.chipStatus.text = "Menunggu"
                        binding.chipStatus.setChipBackgroundColorResource(R.color.status_pending)
                        binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    }
                    "rejected" -> {
                        binding.chipStatus.text = "Ditolak"
                        binding.chipStatus.setChipBackgroundColorResource(R.color.status_rejected)
                        binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    }
                    else -> {
                        binding.chipStatus.text = "Belum Terdaftar"
                        binding.chipStatus.setChipBackgroundColorResource(R.color.gray_400)
                        binding.chipStatus.setTextColor(ContextCompat.getColor(context, R.color.white))
                    }
                }

                if (!vehicle.adminNotes.isNullOrBlank()) {
                    binding.tvAdminNotes.visible()
                    binding.tvAdminNotes.text = "Catatan Admin: ${vehicle.adminNotes}"
                } else {
                    binding.tvAdminNotes.gone()
                }

                binding.root.setOnClickListener {
                    if (isApproved) {
                        onQrClick(vehicle)
                    }
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
