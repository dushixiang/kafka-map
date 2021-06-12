package cn.typesafe.km.service;

import cn.typesafe.km.controller.dto.LoginAccount;
import cn.typesafe.km.controller.dto.PasswordChange;
import cn.typesafe.km.entity.User;
import cn.typesafe.km.repository.UserRepository;
import cn.typesafe.km.util.ID;
import com.github.benmanes.caffeine.cache.Cache;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;
import java.util.NoSuchElementException;

/**
 * @author dushixiang
 * @date 2021/6/12 1:17 下午
 */
@Slf4j
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
            log.info("初始用户名和密码为: {}/{}", username, password);
        }
    }

    public String login(LoginAccount loginAccount) {
        User user = userRepository.findByUsername(loginAccount.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("用户名或密码错误"));
        boolean matches = passwordEncoder.matches(loginAccount.getPassword(), user.getPassword());
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

    public void changePassword(String token, PasswordChange passwordChange) {
        User tokenUser = tokenManager.getIfPresent(token);
        Assert.isTrue(tokenUser != null, "获取用户信息失败");
        User user = userRepository.findById(tokenUser.getId()).orElseThrow(() -> new NoSuchElementException("获取用户信息失败"));
        boolean matches = passwordEncoder.matches(passwordChange.getOldPassword(), user.getPassword());
        if (!matches) {
            throw new IllegalArgumentException("原密码不正确");
        }
        String encodePassword = this.passwordEncoder.encode(passwordChange.getNewPassword());
        user.setPassword(encodePassword);
        userRepository.saveAndFlush(user);
    }
}
