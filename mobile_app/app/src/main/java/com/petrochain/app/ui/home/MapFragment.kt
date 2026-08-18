package com.petrochain.app.ui.home

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.gson.Gson
import com.petrochain.app.R
import com.petrochain.app.databinding.FragmentMapBinding
import com.petrochain.app.data.model.Spbu

class MapFragment : Fragment() {

    private var _binding: FragmentMapBinding? = null
    private val binding get() = _binding!!
    private val viewModel: HomeViewModel by viewModels()
    private lateinit var spbuAdapter: SpbuAdapter
    private var currentFilter = "Semua"

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentMapBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        binding.toolbarMap.setNavigationOnClickListener {
            findNavController().navigateUp()
        }

        setupRecyclerView()
        setupMap()
        setupFilters()
        observeViewModel()
        viewModel.loadSpbus()
    }

    private fun setupRecyclerView() {
        spbuAdapter = SpbuAdapter(emptyList()) { spbu ->
            val bundle = Bundle().apply {
                putString("spbuJson", Gson().toJson(spbu))
            }
            findNavController().navigate(R.id.action_map_to_detail, bundle)
        }
        binding.rvMapSpbu.layoutManager = LinearLayoutManager(requireContext())
        binding.rvMapSpbu.adapter = spbuAdapter
    }

    private fun setupFilters() {
        binding.chipFilterSemua.setOnClickListener { applyFilter("Semua") }
        binding.chipFilterPertalite.setOnClickListener { applyFilter("Pertalite") }
        binding.chipFilterSolar.setOnClickListener { applyFilter("Solar") }
    }

    private fun applyFilter(filter: String) {
        currentFilter = filter
        
        // Update UI styling for chips
        updateChipStyle(binding.chipFilterSemua, filter == "Semua")
        updateChipStyle(binding.chipFilterPertalite, filter == "Pertalite")
        updateChipStyle(binding.chipFilterSolar, filter == "Solar")

        // Re-trigger observer logic to apply filter
        viewModel.spbus.value?.let { updateUIWithData(it) }
    }

    private fun updateChipStyle(chip: TextView, isSelected: Boolean) {
        if (isSelected) {
            chip.setBackgroundResource(R.drawable.bg_badge_available)
            chip.backgroundTintList = android.content.res.ColorStateList.valueOf(android.graphics.Color.parseColor("#980f12"))
            chip.setTextColor(android.graphics.Color.WHITE)
        } else {
            chip.setBackgroundResource(R.drawable.bg_search_bar)
            chip.backgroundTintList = null
            chip.setTextColor(android.graphics.Color.parseColor("#4B5563"))
        }
    }

    @SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
    private fun setupMap() {
        val webView = binding.fullscreenMap
        webView.settings.javaScriptEnabled = true
        webView.settings.cacheMode = WebSettings.LOAD_NO_CACHE
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()
        
        // Expose a bridge to JS
        webView.addJavascriptInterface(WebAppInterface(), "Android")
        
        webView.loadUrl("file:///android_asset/leaflet_fullscreen.html")
    }

    private inner class WebAppInterface {
        @JavascriptInterface
        fun onMarkerClick(spbuId: Int) {
            activity?.runOnUiThread {
                // Find SPBU by ID
                val clickedSpbu = viewModel.spbus.value?.find { it.id == spbuId }
                if (clickedSpbu != null) {
                    val bundle = Bundle().apply {
                        putString("spbuJson", Gson().toJson(clickedSpbu))
                    }
                    findNavController().navigate(R.id.action_map_to_detail, bundle)
                }
            }
        }
    }

    private fun observeViewModel() {
        viewModel.spbus.observe(viewLifecycleOwner) { spbuList ->
            updateUIWithData(spbuList)
        }
    }

    private fun updateUIWithData(spbuList: List<Spbu>) {
        val filteredList = if (currentFilter == "Semua") {
            spbuList
        } else {
            spbuList.filter { spbu ->
                spbu.fuelStocks?.any { 
                    it.fuelType.equals(currentFilter, ignoreCase = true) && 
                    (it.status == "available" || it.status == "limited") 
                } == true
            }
        }

        spbuAdapter.updateData(filteredList)
        val jsonSpbus = Gson().toJson(filteredList)
        binding.fullscreenMap.evaluateJavascript("javascript:setSpbus('$jsonSpbus');", null)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
