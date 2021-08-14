package cn.typesafe.km;

import cn.typesafe.km.service.ClusterService;
import cn.typesafe.km.service.UserService;
import lombok.SneakyThrows;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.annotation.Resource;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@EnableScheduling
@SpringBootApplication
public class KafkaMapApplication implements CommandLineRunner {

    public static void main(String[] args) {
        initDatabaseDir();
        SpringApplication.run(KafkaMapApplication.class, args);
    }

    @SneakyThrows
    public static void initDatabaseDir(){
        Path dbPath = Paths.get("data");
        if (!Files.exists(dbPath)) {
            Files.createDirectory(dbPath);
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
