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
                placeholder(R.drawable.bg_placeholder)
                error(R.drawable.bg_placeholder)
            }
        }

        binding.llDetailFuelStocks.removeAllViews()
        spbu.fuelStocks?.forEach { stock ->
            val badgeView = LayoutInflater.from(requireContext())
                .inflate(R.layout.item_fuel_badge, binding.llDetailFuelStocks, false) as android.widget.LinearLayout
            
            val tvBadge = badgeView.findViewById<TextView>(R.id.tvBadge)
            val ivBadgeIcon = badgeView.findViewById<android.widget.ImageView>(R.id.ivBadgeIcon)
            
            tvBadge.text = "${stock.fuelType.replaceFirstChar { it.uppercase() }}: ${stock.status.replaceFirstChar { it.uppercase() }}"
            
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
            binding.llDetailFuelStocks.addView(badgeView)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
