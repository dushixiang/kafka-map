package cn.typesafe.km.util;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.ServletContext;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Objects;

public class Web {

    public static HttpServletRequest getRequest() {
        return ((ServletRequestAttributes) Objects.requireNonNull(RequestContextHolder.getRequestAttributes())).getRequest();
    }

    public static ServletContext getServletContext() {
        return getRequest().getServletContext();
    }

    public static String getToken() {
        return getRequest().getHeader("X-Auth-Token");
    }
}
