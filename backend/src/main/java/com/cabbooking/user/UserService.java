package com.cabbooking.user;

import com.cabbooking.auth.User;
import com.cabbooking.auth.UserRepository;
import com.cabbooking.document.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DocumentService documentService;

    public UserService(UserRepository userRepository, DocumentService documentService) {
        this.userRepository = userRepository;
        this.documentService = documentService;
    }

    public User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public User updateUserLocation(Long userId, Double latitude, Double longitude) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCurrentLatitude(latitude);
        user.setCurrentLongitude(longitude);
        return userRepository.save(user);
    }

    public User toggleDriverAvailability(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getIsAvailable() == null) {
            user.setIsAvailable(true);
        } else {
            user.setIsAvailable(!user.getIsAvailable());
        }
        return userRepository.save(user);
    }

    public String uploadDocument(Long userId, MultipartFile file) {
        // Upload to MinIO
        String fileName = documentService.uploadFile(file);
        // Here we might want to save the document URL/Metadata in a separate Document
        // entity
        // linked to the user. For MVP, we aren't saving it in DB yet, or we can add a
        // field in User.
        // Let's assume we just return the filename for now or save it if we add a
        // field.

        // TODO: Save document reference in DB
        return fileName;
    }
}
