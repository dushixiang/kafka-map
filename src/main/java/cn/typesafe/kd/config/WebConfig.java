package cn.typesafe.kd.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * @author dushixiang
 * @date 2021/3/28 5:37 下午
 */
@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {

            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowCredentials(false)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTION")
                        .allowedHeaders("*")
                        .exposedHeaders("*");
            }
        };
    }
}
