package cn.typesafe.km.interceptor;

import cn.typesafe.km.entity.User;
import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

/**
 * @author dushixiang
 * @date 2021/6/12 1:30 下午
 */
@Order(1)
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Resource
    private Cache<String, User> tokenManager;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String tokenHeader = request.getHeader("X-Auth-Token");
        if (!StringUtils.hasText(tokenHeader)) {
            tokenHeader = request.getParameter("X-Auth-Token");
        }

        if (StringUtils.hasText(tokenHeader)) {
            User user = tokenManager.getIfPresent(tokenHeader);
            if (user != null) {
                return true;
            }
        }

        try (PrintWriter writer = response.getWriter()) {
            response.addHeader("Content-Type", "application/json");
            response.setStatus(401);
            writer.write("{\"code\":\"401\",\"message\":\"Unauthorized\"}");
        }
        return false;
    }
}
