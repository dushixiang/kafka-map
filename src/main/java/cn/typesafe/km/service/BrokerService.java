package cn.typesafe.km.service;

import cn.typesafe.km.service.dto.Broker;
import cn.typesafe.km.service.dto.ServerConfig;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionInfo;
import org.apache.kafka.common.config.ConfigResource;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * @author dushixiang
 * @date 2021/4/2 20:45
 */
@Slf4j
@Service
public class BrokerService {

    @Resource
    private ClusterService clusterService;

    public int countBroker(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        DescribeClusterResult describeClusterResult = adminClient.describeCluster();
        return describeClusterResult.nodes().get().size();
    }

    public List<Broker> brokers(Set<String> topicNames, String clusterId) throws ExecutionException, InterruptedException {

        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        DescribeClusterResult describeClusterResult = adminClient.describeCluster();
        Collection<Node> clusterDetails = describeClusterResult.nodes().get();
        List<Broker> brokers = new ArrayList<>(clusterDetails.size());
        for (Node node : clusterDetails) {
            Broker broker = new Broker();
            broker.setId(node.id());
            broker.setHost(node.host());
            broker.setPort(node.port());
            brokers.add(broker);
        }


        if (CollectionUtils.isEmpty(topicNames)) {
            topicNames = adminClient.listTopics().names().get();
        }
        Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(topicNames).all().get();
        for (TopicDescription topicDescription : stringTopicDescriptionMap.values()) {
            List<TopicPartitionInfo> partitions = topicDescription.partitions();
            for (TopicPartitionInfo partitionInfo : partitions) {
                Node leader = partitionInfo.leader();
                for (Broker broker : brokers) {
                    if (leader != null && broker.getId() == leader.id()) {
                        broker.getLeaderPartitions().add(partitionInfo.partition());
                        break;
                    }
                }

                List<Node> replicas = partitionInfo.replicas();
                for (Broker broker : brokers) {
                    for (Node replica : replicas) {
                        if (broker.getId() == replica.id()) {
                            broker.getFollowerPartitions().add(partitionInfo.partition());
                            break;
                        }
                    }
                }
            }
        }

        if (!CollectionUtils.isEmpty(topicNames)) {
            // 使用topic过滤时只展示相关的broker
            brokers = brokers.stream()
                    .filter(broker -> broker.getFollowerPartitions().size() > 0 || broker.getLeaderPartitions().size() > 0)
                    .collect(Collectors.toList());
        }

        return brokers;
    }

    public List<ServerConfig> getConfigs(String id, String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        ConfigResource configResource = new ConfigResource(ConfigResource.Type.BROKER, id);

        Config config = adminClient.describeConfigs(Collections.singletonList(configResource)).all().get().get(configResource);

        return config.entries()
                .stream()
                .map(entry -> {
                    ServerConfig topicConfig = new ServerConfig();
                    topicConfig.setName(entry.name());
                    topicConfig.setValue(entry.value());
                    topicConfig.set_default(entry.isDefault());
                    topicConfig.setReadonly(entry.isReadOnly());
                    topicConfig.setSensitive(entry.isSensitive());
                    return topicConfig;
                })
                .collect(Collectors.toList());
    }

    public void setConfigs(String id, String clusterId, Map<String, String> configs) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        ConfigResource configResource = new ConfigResource(ConfigResource.Type.BROKER, id);

        List<AlterConfigOp> alterConfigOps = configs.entrySet()
                .stream()
                .map(e -> {
                    String key = e.getKey();
                    String value = e.getValue();
                    ConfigEntry configEntry = new ConfigEntry(key, value);
                    return new AlterConfigOp(configEntry, AlterConfigOp.OpType.SET);
                })
                .collect(Collectors.toList());

        Map<ConfigResource, Collection<AlterConfigOp>> data = new HashMap<>();
        data.put(configResource, alterConfigOps);

        adminClient.incrementalAlterConfigs(data).all().get();
    }
}
