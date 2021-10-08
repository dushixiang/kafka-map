package cn.typesafe.km.service;

import cn.typesafe.km.config.Constant;
import cn.typesafe.km.delay.DelayMessageHelper;
import cn.typesafe.km.entity.Cluster;
import cn.typesafe.km.repository.ClusterRepository;
import cn.typesafe.km.util.ID;
import cn.typesafe.km.util.Networks;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
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
@Slf4j
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

    private final ConcurrentHashMap<String, DelayMessageHelper> store = new ConcurrentHashMap<>();

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
        return createConsumer(cluster.getServers(), Constant.CONSUMER_GROUP_ID, "earliest");
    }

    public KafkaConsumer<String, String> createConsumer(String servers, String groupId, String autoOffsetResetConfig) {
        Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        properties.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "100");
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, autoOffsetResetConfig);
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        properties.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
        return new KafkaConsumer<>(properties, new StringDeserializer(), new StringDeserializer());
    }

    public KafkaProducer<String, String> createProducer(String servers) {
        Properties properties = new Properties();
        properties.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        return new KafkaProducer<>(properties, new StringSerializer(), new StringSerializer());
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
            int port = Integer.parseInt(split[1]);
            boolean hostConnected = Networks.isHostConnected(host, port, 30000);
            if (!hostConnected) {
                throw new IllegalArgumentException("server " + server + " can't connected.");
            }
        }

        AdminClient adminClient = getAdminClient(uuid, cluster.getServers());
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

    @Transactional(rollbackFor = Exception.class)
    public void updateNameById(String clusterId, String name) {
        Cluster cluster = findById(clusterId);
        cluster.setName(name);
        clusterRepository.saveAndFlush(cluster);
    }

    public Cluster detail(String clusterId) throws ExecutionException, InterruptedException {
        Cluster cluster = findById(clusterId);
        Set<String> topicNames = topicService.topicNames(cluster.getId());
        cluster.setTopicCount(topicNames.size());
        cluster.setBrokerCount(brokerService.countBroker(cluster.getId()));
        cluster.setConsumerCount(consumerGroupService.countConsumerGroup(cluster.getId()));
        return cluster;
    }

    @Transactional
    public void enableDelayMessage(String id) {
        Cluster cluster = findById(id);
        if (Constant.DELAY_MESSAGE_ENABLED.equals(cluster.getDelayMessageStatus())) {
            return;
        }
        DelayMessageHelper delayMessageHelper = store.getOrDefault(id, new DelayMessageHelper(cluster.getServers(), Constant.CONSUMER_GROUP_ID));
        store.put(id, delayMessageHelper);
        delayMessageHelper.start();
        cluster.setDelayMessageStatus(Constant.DELAY_MESSAGE_ENABLED);
        clusterRepository.saveAndFlush(cluster);
    }

    @Transactional
    public void disableDelayMessage(String id) {
        Cluster cluster = findById(id);
        if (Constant.DELAY_MESSAGE_DISABLED.equals(cluster.getDelayMessageStatus())) {
            return;
        }
        DelayMessageHelper delayMessageHelper = store.getOrDefault(id, new DelayMessageHelper(cluster.getServers(), Constant.CONSUMER_GROUP_ID));
        store.put(id, delayMessageHelper);
        delayMessageHelper.stop();
        cluster.setDelayMessageStatus(Constant.DELAY_MESSAGE_DISABLED);
        clusterRepository.saveAndFlush(cluster);
    }

    public void restore() {
        List<Cluster> clusters = clusterRepository.findAll();
        for (Cluster cluster : clusters) {
            if (Constant.DELAY_MESSAGE_ENABLED.equals(cluster.getDelayMessageStatus())) {
                try {
                    String clusterId = cluster.getId();
                    DelayMessageHelper delayMessageHelper = store.getOrDefault(clusterId, new DelayMessageHelper(cluster.getServers(), Constant.CONSUMER_GROUP_ID));
                    store.put(clusterId, delayMessageHelper);
                    delayMessageHelper.start();
                } catch (Exception e) {
                    log.error("恢复延迟消息失败，集群名称: {}，集群地址: {}", cluster.getName(), cluster.getServers(), e);
                    this.disableDelayMessage(cluster.getId());
                }
            }

        }
    }
}
