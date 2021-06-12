package cn.typesafe.km.service;

import cn.typesafe.km.controller.dto.LoginAccount;
import cn.typesafe.km.entity.User;
import cn.typesafe.km.repository.UserRepository;
import cn.typesafe.km.util.ID;
import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;

/**
 * @author dushixiang
 * @date 2021/6/12 1:17 下午
 */
@Service
public class UserService {

    @Value("${default.username}")
    private String username;
    @Value("${default.password}")
    private String password;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Resource
    private UserRepository userRepository;
    @Resource
    private Cache<String, User> tokenManager;

    public void initUser() {
        if (CollectionUtils.isEmpty(userRepository.findAll())) {
            User user = new User();
            user.setId(ID.uuid());
            user.setUsername(username);
            String encodePassword = this.passwordEncoder.encode(password);
            user.setPassword(encodePassword);
            userRepository.saveAndFlush(user);
        }
    }

    public String login(LoginAccount loginAccount) {
        User user = userRepository.findByUsername(loginAccount.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("用户名或密码错误"));
        String password = user.getPassword();
        boolean matches = passwordEncoder.matches(loginAccount.getPassword(), password);
        if (!matches) {
            throw new IllegalArgumentException("用户名或密码错误");
        }

        String token = ID.uuid();
        tokenManager.put(token, user);
        return token;
    }

    public void logout(String token) {
        tokenManager.invalidate(token);
    }

    public User info(String token) {
        User user = tokenManager.getIfPresent(token);
        if (user != null) {
            user.setPassword(null);
        }
        return user;
    }
}
