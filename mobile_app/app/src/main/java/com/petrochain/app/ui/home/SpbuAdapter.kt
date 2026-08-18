package com.petrochain.app.ui.home

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.petrochain.app.R
import com.petrochain.app.data.model.Spbu

class SpbuAdapter(
    private var spbuList: List<Spbu>,
    private val onItemClick: ((Spbu) -> Unit)? = null
) : RecyclerView.Adapter<SpbuAdapter.SpbuViewHolder>() {

    fun updateData(newList: List<Spbu>) {
        spbuList = newList
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SpbuViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_spbu, parent, false)
        return SpbuViewHolder(view)
    }

    override fun onBindViewHolder(holder: SpbuViewHolder, position: Int) {
        val spbu = spbuList[position]
        holder.bind(spbu)
        holder.itemView.setOnClickListener {
            onItemClick?.invoke(spbu)
        }
    }

    override fun getItemCount(): Int = spbuList.size

    class SpbuViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivSpbuImage: ImageView = itemView.findViewById(R.id.ivSpbuImage)
        private val tvName: TextView = itemView.findViewById(R.id.tvSpbuName)
        private val tvAddress: TextView = itemView.findViewById(R.id.tvSpbuAddress)
        private val llFuelStocks: LinearLayout = itemView.findViewById(R.id.llFuelStocks)

        fun bind(spbu: Spbu) {
            tvName.text = spbu.name
            tvAddress.text = spbu.address

            if (!spbu.imageUrl.isNullOrEmpty()) {
                ivSpbuImage.load(spbu.imageUrl) {
                    crossfade(true)
                    placeholder(R.drawable.bg_placeholder)
                    error(R.drawable.bg_placeholder)
                }
            } else {
                ivSpbuImage.setImageResource(R.drawable.bg_placeholder)
            }

            llFuelStocks.removeAllViews()

            spbu.fuelStocks?.forEach { stock ->
                val badgeView = LayoutInflater.from(itemView.context)
                    .inflate(R.layout.item_fuel_badge, llFuelStocks, false) as LinearLayout
                
                val tvBadge = badgeView.findViewById<TextView>(R.id.tvBadge)
                val ivBadgeIcon = badgeView.findViewById<ImageView>(R.id.ivBadgeIcon)
                
                val fuelName = when (stock.fuelType.lowercase()) {
                    "pertamax_turbo" -> "P-Turbo"
                    else -> stock.fuelType.replaceFirstChar { it.uppercase() }
                }
                val statusName = when (stock.status.lowercase()) {
                    "available" -> "Ada"
                    "empty" -> "Habis"
                    "limited" -> "Terbatas"
                    else -> stock.status.replaceFirstChar { it.uppercase() }
                }
                tvBadge.text = "$fuelName: $statusName"
                
                // Color coding based on status
                if (stock.status == "empty") {
                    tvBadge.setTextColor(android.graphics.Color.parseColor("#991b1b"))
                    badgeView.setBackgroundResource(R.drawable.bg_search_bar)
                    ivBadgeIcon.setImageResource(R.drawable.ic_block)
                    ivBadgeIcon.setColorFilter(android.graphics.Color.parseColor("#991b1b"))
                } else if (stock.status == "limited") {
                    tvBadge.setTextColor(android.graphics.Color.parseColor("#b45309"))
                    ivBadgeIcon.setImageResource(R.drawable.ic_info)
                    ivBadgeIcon.setColorFilter(android.graphics.Color.parseColor("#b45309"))
                } else {
                    tvBadge.setTextColor(android.graphics.Color.parseColor("#166534"))
                    ivBadgeIcon.setImageResource(R.drawable.ic_check)
                    ivBadgeIcon.setColorFilter(android.graphics.Color.parseColor("#166534"))
                }

                llFuelStocks.addView(badgeView)
            }
        }
    }
}
