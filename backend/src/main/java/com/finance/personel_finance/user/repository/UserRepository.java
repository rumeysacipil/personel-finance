package com.finance.personel_finance.user.repository;

import com.finance.personel_finance.user.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByRefreshTokenHash(String refreshTokenHash);

}
