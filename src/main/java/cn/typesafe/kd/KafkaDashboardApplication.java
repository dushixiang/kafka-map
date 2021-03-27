package cn.typesafe.kd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class KafkaDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(KafkaDashboardApplication.class, args);
    }

}
