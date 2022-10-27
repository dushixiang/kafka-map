package cn.typesafe.km.interceptor;

import cn.typesafe.km.config.Constant;
import cn.typesafe.km.entity.User;
import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;
import reactor.core.publisher.Mono;

import javax.annotation.Resource;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * @author dushixiang
 * @date 2021/6/12 1:30 下午
 */
@Order(2)
@Component
public class AuthInterceptor implements WebFilter {

    @Resource
    private Cache<String, User> tokenManager;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain filterChain) {
        HttpMethod method = exchange.getRequest().getMethod();
        if (Objects.equals(method, HttpMethod.OPTIONS)) {
            return filterChain.filter(exchange);
        }
        // Specify the url to be intercepted
        List<PathPattern> authUrls =
                Stream.of("/info", "/change-password", "/brokers/**", "/clusters/**", "/consumerGroups/**", "/topics/**")
                        .map(PathPatternParser.defaultInstance::parse)
                        .collect(Collectors.toList());
        boolean anyMatch = authUrls.stream()
                .anyMatch(pat -> pat.matches(exchange.getRequest().getPath().pathWithinApplication()));

        if (anyMatch) {
            List<String> tokenHeaders = exchange.getRequest().getHeaders().get(Constant.HEADER_X_AUTH_TOKEN);
            String token = "";
            if (Objects.isNull(tokenHeaders) || tokenHeaders.size() == 0) {
                MultiValueMap<String, String> queryParams = exchange.getRequest().getQueryParams();
                token = queryParams.getFirst(Constant.HEADER_X_AUTH_TOKEN);
            } else {
                token = tokenHeaders.get(0);
            }

            if (StringUtils.hasText(token)) {
                User user = tokenManager.getIfPresent(token);
                if (Objects.nonNull(user)) {
                    return filterChain.filter(exchange);
                }
            }

            ServerHttpResponse response = exchange.getResponse();
            DataBuffer dataBuffer = response.bufferFactory().allocateBuffer();
            dataBuffer = dataBuffer.write("{\"code\":\"401\",\"message\":\"Unauthorized\"}", StandardCharsets.UTF_8);
            response.getHeaders().set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
            response.setStatusCode(HttpStatus.UNAUTHORIZED);

            return response.writeWith(Mono.just(dataBuffer));
        }

        return filterChain.filter(exchange);
    }
}
