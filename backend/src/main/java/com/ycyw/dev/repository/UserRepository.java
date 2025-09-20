package com.ycyw.dev.repository;

import com.ycyw.dev.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}
