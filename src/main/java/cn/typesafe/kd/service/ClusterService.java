package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.repository.ClusterRepository;
import cn.typesafe.kd.util.ID;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.Date;
import java.util.NoSuchElementException;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;

/**
 * @author dushixiang
 * @date 2021/3/27 11:16 上午
 */
@Service
public class ClusterService {

    private final ConcurrentHashMap<String, AdminClient> clients = new ConcurrentHashMap<>();

    @Resource
    private ClusterRepository clusterRepository;

    public Cluster findById(String id) {
        return clusterRepository.findById(id).orElseThrow(() -> new NoSuchElementException("cluster 「" + id + "」does not exist"));
    }

    private AdminClient createAdminClient(String servers) {
        Properties properties = new Properties();
        properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, "5000");
        return AdminClient.create(properties);
    }

    public AdminClient getAdminClient(String id, String servers) {
        synchronized (id.intern()) {
            AdminClient adminClient = clients.get(id);
            if (adminClient == null) {
                adminClient = createAdminClient(servers);
                clients.put(id, adminClient);
            }
            return adminClient;
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(Cluster cluster) throws ExecutionException, InterruptedException {
        String uuid = ID.uuid();

        AdminClient adminClient = getAdminClient(uuid, cluster.getServers());
        String clusterId = adminClient.describeCluster().clusterId().get();
        String controller = adminClient.describeCluster().controller().get().host();

        cluster.setId(uuid);
        cluster.setController(controller);
        cluster.setMonitor(true);
        cluster.setCreated(new Date());

        clusterRepository.saveAndFlush(cluster);
    }
}
