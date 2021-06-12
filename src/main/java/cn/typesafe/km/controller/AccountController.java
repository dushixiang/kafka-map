package cn.typesafe.km.controller;

import cn.typesafe.km.controller.dto.LoginAccount;
import cn.typesafe.km.entity.User;
import cn.typesafe.km.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * @author dushixiang
 * @date 2021/6/12 2:33 下午
 */
@RestController
public class AccountController {

    @Resource
    private UserService userService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginAccount loginAccount) {
        String token = userService.login(loginAccount);
        return Map.of(
                "token", token
        );
    }

    @PostMapping("/logout")
    public void logout(HttpServletRequest request) {
        String token = request.getHeader("X-Auth-Token");
        userService.logout(token);
    }

    @GetMapping("/info")
    public User info(HttpServletRequest request) {
        String token = request.getHeader("X-Auth-Token");
        return userService.info(token);
    }
}
