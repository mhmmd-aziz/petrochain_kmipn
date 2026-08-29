package com.petrochain.app.ui.home

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import coil.load
import com.google.gson.Gson
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentSpbuDetailBinding
import com.petrochain.app.data.model.Spbu

class SpbuDetailFragment : Fragment() {

    private var _binding: FragmentSpbuDetailBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSpbuDetailBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        binding.toolbarDetail.setNavigationOnClickListener {
            findNavController().navigateUp()
        }

        val spbuJson = arguments?.getString("spbuJson")
        if (spbuJson != null) {
            val spbu = Gson().fromJson(spbuJson, Spbu::class.java)
            populateUI(spbu)
        }
    }

    private fun populateUI(spbu: Spbu) {
        binding.toolbarDetail.title = spbu.name
        binding.tvDetailName.text = spbu.name
        binding.tvDetailCode.text = "Kode: ${spbu.code}"
        binding.tvDetailAddress.text = "${spbu.address}, ${spbu.city}"

        // ImageView from include/binding might need manual findViewById since it's nested in CollapsingToolbar
        val ivBanner = binding.root.findViewById<android.widget.ImageView>(R.id.ivDetailBanner)
        if (!spbu.imageUrl.isNullOrEmpty() && ivBanner != null) {
            ivBanner.load(spbu.imageUrl) {
                crossfade(true)
                placeholder(R.drawable.img_spbu_placeholder)
                error(R.drawable.img_spbu_placeholder)
            }
        }

        binding.llDetailFuelStocks.removeAllViews()
        spbu.fuelStocks?.forEach { stock ->
            val badgeView = LayoutInflater.from(requireContext())
                .inflate(R.layout.item_fuel_badge, binding.llDetailFuelStocks, false) as android.widget.LinearLayout
            
            val tvBadge = badgeView.findViewById<TextView>(R.id.tvBadge)
            val ivBadgeIcon = badgeView.findViewById<android.widget.ImageView>(R.id.ivBadgeIcon)
            
            tvBadge.text = "${stock.fuelType.replaceFirstChar { it.uppercase() }}: ${stock.status.replaceFirstChar { it.uppercase() }}"
            
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

            binding.llDetailFuelStocks.addView(badgeView)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
