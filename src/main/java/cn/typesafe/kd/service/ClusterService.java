package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.repository.ClusterRepository;
import cn.typesafe.kd.util.ID;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
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
    private final ConcurrentHashMap<String, KafkaConsumer<String, String>> consumers = new ConcurrentHashMap<>();

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
        return AdminClient.create(properties);
    }

    public KafkaConsumer<String, String> createConsumer(String servers, String groupId) {
        Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        properties.put(ConsumerConfig.REQUEST_TIMEOUT_MS_CONFIG, "5000");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        properties.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "500");
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

    public KafkaConsumer<String, String> getConsumer(String id) {
        synchronized (id.intern()) {
            var kafkaConsumer = consumers.get(id);
            if (kafkaConsumer == null) {
                Cluster cluster = findById(id);
                kafkaConsumer = createConsumer(cluster.getServers(), "kafka-dashboard");
                consumers.put(id, kafkaConsumer);
            }
            return kafkaConsumer;
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
        cluster.setCreated(new Date());

        clusterRepository.saveAndFlush(cluster);
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteByIdIn(List<String> idList) {
        for (String id : idList) {
            clients.remove(id);
            consumers.remove(id);
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
