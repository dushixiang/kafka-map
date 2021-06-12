package cn.typesafe.km.config;

import cn.typesafe.km.entity.User;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * @author dushixiang
 * @date 2021/6/12 1:58 下午
 */
@Configuration
public class CacheConfig {

    @Bean(name = "tokenManager")
    public Cache<String, User> tokenManager() {
        return Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(2, TimeUnit.HOURS)
                .build();
    }
}
