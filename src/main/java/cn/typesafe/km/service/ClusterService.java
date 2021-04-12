package cn.typesafe.km.service;

import cn.typesafe.km.config.Constant;
import cn.typesafe.km.entity.Cluster;
import cn.typesafe.km.repository.ClusterRepository;
import cn.typesafe.km.util.ID;
import cn.typesafe.km.util.Networks;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.*;
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
    @Resource
    private TopicService topicService;
    @Resource
    private BrokerService brokerService;
    @Resource
    private ConsumerGroupService consumerGroupService;

    public Cluster findById(String id) {
        return clusterRepository.findById(id).orElseThrow(() -> new NoSuchElementException("cluster 「" + id + "」does not exist"));
    }

    private AdminClient createAdminClient(String servers) {
        Properties properties = new Properties();
        properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, "5000");
        properties.put(AdminClientConfig.RETRIES_CONFIG, "0");
        return AdminClient.create(properties);
    }

    public KafkaConsumer<String, String> createConsumer(String clusterId) {
        Cluster cluster = findById(clusterId);
        return createConsumer(cluster.getServers(), Constant.CONSUMER_GROUP_ID);
    }

    public KafkaConsumer<String, String> createConsumer(String servers, String groupId) {
        Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "100");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        properties.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
        return new KafkaConsumer<>(properties, new StringDeserializer(), new StringDeserializer());
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

    public AdminClient getAdminClient(String id) {
        synchronized (id.intern()) {
            AdminClient adminClient = clients.get(id);
            if (adminClient == null) {
                Cluster cluster = findById(id);
                adminClient = createAdminClient(cluster.getServers());
                clients.put(id, adminClient);
            }
            return adminClient;
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void create(Cluster cluster) throws ExecutionException, InterruptedException {
        String uuid = ID.uuid();
        for (String server : cluster.getServers().split(",")) {
            String[] split = server.split(":");
            String host = split[0];
            boolean hostReachable = Networks.isHostReachable(host);
            if (!hostReachable) {
                throw new IllegalArgumentException("Host " + host + " is not reachable.");
            }
            int port = Integer.parseInt(split[1]);
            boolean hostConnected = Networks.isHostConnected(host, port);
            if (!hostConnected) {
                throw new IllegalArgumentException("server " + server + " can't connected.");
            }
        }

        AdminClient adminClient = getAdminClient(uuid, cluster.getServers());
        String clusterId = adminClient.describeCluster().clusterId().get();
        String controller = adminClient.describeCluster().controller().get().host();

        cluster.setId(uuid);
        cluster.setController(controller);
        cluster.setCreated(new Date());

        clusterRepository.saveAndFlush(cluster);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteByIdIn(List<String> idList) {
        for (String id : idList) {
            clients.remove(id);
            clusterRepository.deleteById(id);
        }
    }

    public void setProperties(List<Cluster> clusters) throws ExecutionException, InterruptedException {
        for (Cluster cluster : clusters) {
            Set<String> topicNames = topicService.topicNames(cluster.getId());
            cluster.setTopicCount(topicNames.size());
            cluster.setBrokerCount(brokerService.countBroker(cluster.getId()));
            cluster.setConsumerCount(consumerGroupService.countConsumerGroup(cluster.getId()));
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateNameById(String clusterId, String name) {
        Cluster cluster = findById(clusterId);
        cluster.setName(name);
        clusterRepository.saveAndFlush(cluster);
    }
}
