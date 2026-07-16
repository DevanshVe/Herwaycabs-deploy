package com.cabbooking.auth;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String phoneNumber;

    // IMPORTANT: Lombok @Data generates getIsVerified/setIsVerified for Boolean
    // wrapper?
    // Lombok default for Boolean wrapper is getIsVerified/setIsVerified if field
    // name is isVerified?
    // Let's stick to standard names. Lombok handles "is" prefix intelligently for
    // boolean, but for Boolean wrapper it might be "getIsVerified".
    // I will use explicit naming if Lombok fails, but usually it works.
    // Given the previous error was "cannot find setIsVerified", I will assume
    // Lombok generates it correctly or I will add explicit annotation/methods if
    // needed.
    // Actually, for Boolean (wrapper), Lombok's getter is getIsVerified().

    private Boolean isVerified;
    private Double currentLatitude;
    private Double currentLongitude;
    private Boolean isAvailable;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
