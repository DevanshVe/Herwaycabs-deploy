package com.cabbooking.user;

import com.cabbooking.auth.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(user);
    }

    @PostMapping("/driver/location")
    public ResponseEntity<User> updateLocation(
            @AuthenticationPrincipal User user,
            @RequestParam Double lat,
            @RequestParam Double lon) {
        return ResponseEntity.ok(userService.updateUserLocation(user.getId(), lat, lon));
    }

    @PostMapping("/driver/toggle-availability")
    public ResponseEntity<User> toggleAvailability(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.toggleDriverAvailability(user.getId()));
    }

    @PostMapping("/upload-document")
    public ResponseEntity<String> uploadDocument(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.uploadDocument(user.getId(), file));
    }
}
