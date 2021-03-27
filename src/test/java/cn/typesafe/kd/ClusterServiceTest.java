package cn.typesafe.kd;
import java.util.Date;
import java.util.concurrent.ExecutionException;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.service.ClusterService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.Resource;

/**
 * @author dushixiang
 * @date 2021/3/26 11:41 上午
 */
@SpringBootTest
public class ClusterServiceTest {

    @Resource
    private ClusterService clusterService;

    @Test
    public void testGetAdminClient() throws ExecutionException, InterruptedException {
        Cluster cluster = new Cluster();

        cluster.setName("测试");
        cluster.setServers("10.1.5.84:9094");

        clusterService.create(cluster);
    }
}
