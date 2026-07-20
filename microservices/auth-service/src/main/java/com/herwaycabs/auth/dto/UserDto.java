package com.herwaycabs.auth.dto;

import com.herwaycabs.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// User summary for admin listings — never exposes the password hash.
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phoneNumber;
    private String gender;
    private Boolean isVerified;
}
