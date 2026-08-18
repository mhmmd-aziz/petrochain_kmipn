package com.petrochain.app.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.petrochain.app.data.repository.AuthRepository
import com.petrochain.app.databinding.FragmentProfileBinding
import com.petrochain.app.ui.main.MainActivity
import com.petrochain.app.util.TokenManager
import kotlinx.coroutines.launch

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.tvUserName.text = TokenManager.getUserName()
        binding.tvUserEmail.text = TokenManager.getUserEmail()
        binding.tvUserRole.text = when (TokenManager.getUserRole()) {
            "public" -> "Masyarakat"
            "operator" -> "Operator SPBU"
            "admin" -> "Administrator"
            "auditor" -> "Auditor"
            else -> TokenManager.getUserRole()
        }

        // Avatar initials
        val initials = TokenManager.getUserName()
            .split(" ")
            .take(2)
            .joinToString("") { it.first().uppercase() }
        binding.tvAvatarInitials.text = initials

        binding.btnLogout.setOnClickListener {
            lifecycleScope.launch {
                AuthRepository().logout()
                (activity as? MainActivity)?.logout()
            }
        }

        val toastListener = View.OnClickListener {
            android.widget.Toast.makeText(requireContext(), "Fitur ini akan segera hadir!", android.widget.Toast.LENGTH_SHORT).show()
        }
        binding.btnEditProfile.setOnClickListener(toastListener)
        binding.btnSecurity.setOnClickListener(toastListener)
        binding.btnHelp.setOnClickListener(toastListener)
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
