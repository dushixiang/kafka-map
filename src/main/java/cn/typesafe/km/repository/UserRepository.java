package cn.typesafe.km.repository;

import cn.typesafe.km.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * @author dushixiang
 * @date 2021/6/10 1:13 下午
 */
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

}
