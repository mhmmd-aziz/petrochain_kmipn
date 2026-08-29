package com.petrochain.app.ui.home

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.petrochain.app.R

data class BannerItem(
    val title: String,
    val subtitle: String,
    val imageResId: Int
)

class HomeBannerAdapter(private val items: List<BannerItem>) : RecyclerView.Adapter<HomeBannerAdapter.BannerViewHolder>() {

    inner class BannerViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.tvBannerTitle)
        val subtitle: TextView = view.findViewById(R.id.tvBannerSubtitle)
        val image: ImageView = view.findViewById(R.id.ivBanner)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BannerViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_home_banner, parent, false)
        return BannerViewHolder(view)
    }

    override fun onBindViewHolder(holder: BannerViewHolder, position: Int) {
        val item = items[position]
        holder.title.text = item.title
        holder.subtitle.text = item.subtitle
        holder.image.setImageResource(item.imageResId)
    }

    override fun getItemCount(): Int = items.size
}
