package cn.typesafe.km.util;

import org.springframework.http.server.reactive.ServerHttpRequest;

/**
 * @author huyaro
 * @date 2022-10-27
 */
public interface Web {

    /**
     * get token from request
     *
     * @param request http request
     * @return token
     */
    static String getToken(ServerHttpRequest request) {
        return request.getHeaders().getFirst("X-Auth-Token");
    }
}
