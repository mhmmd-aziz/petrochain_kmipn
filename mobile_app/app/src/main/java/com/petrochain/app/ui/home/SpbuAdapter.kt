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
                    placeholder(R.drawable.img_spbu_placeholder)
                    error(R.drawable.img_spbu_placeholder)
                }
            } else {
                ivSpbuImage.setImageResource(R.drawable.img_spbu_placeholder)
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
                
                val colorRes: Int
                if (stock.status == "empty") {
                    colorRes = android.graphics.Color.parseColor("#EF4444")
                    ivBadgeIcon.setImageResource(R.drawable.ic_block)
                } else if (stock.status == "limited") {
                    colorRes = android.graphics.Color.parseColor("#F59E0B")
                    ivBadgeIcon.setImageResource(R.drawable.ic_info)
                } else {
                    colorRes = android.graphics.Color.parseColor("#10B981")
                    ivBadgeIcon.setImageResource(R.drawable.ic_check)
                }

                tvBadge.setTextColor(colorRes)
                ivBadgeIcon.setColorFilter(colorRes)
                
                val bg = android.graphics.drawable.GradientDrawable()
                bg.shape = android.graphics.drawable.GradientDrawable.RECTANGLE
                bg.cornerRadius = 40f
                bg.setColor(android.graphics.Color.WHITE)
                bg.setStroke(3, colorRes)
                badgeView.background = bg

                llFuelStocks.addView(badgeView)
            }
        }
    }
}
