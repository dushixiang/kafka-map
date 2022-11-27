package cn.typesafe.km;

import cn.typesafe.km.service.ClusterService;
import cn.typesafe.km.service.UserService;
import jakarta.annotation.Resource;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
//@RegisterReflectionForBinding({SQLiteDialect.class,})
@Slf4j
@EnableScheduling
@SpringBootApplication
public class KafkaMapApplication implements CommandLineRunner {

    public static void main(String[] args) {
        initDatabaseDir();
        SpringApplication.run(KafkaMapApplication.class, args);
    }

    @SneakyThrows
    public static void initDatabaseDir() {
        Path dbPath = Paths.get("data");
        if (!Files.exists(dbPath)) {
            Files.createDirectory(dbPath);
            log.debug("create dir: {}", dbPath);
        }
    }

    @Resource
    private UserService userService;
    @Resource
    private ClusterService clusterService;

    @Override
    public void run(String... args) throws Exception {
        userService.initUser();
        clusterService.restore();
    }
}
