package cn.typesafe.km.service;

import cn.typesafe.km.service.dto.Broker;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.DescribeClusterResult;
import org.apache.kafka.clients.admin.TopicDescription;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartitionInfo;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * @author dushixiang
 * @date 2021/4/2 20:45
 */
@Service
public class BrokerService {

    @Resource
    private ClusterService clusterService;
    @Resource
    private TopicService topicService;

    //    public List<Broker> brokers() {
//
//    }
    public int countBroker(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        DescribeClusterResult describeClusterResult = adminClient.describeCluster();
        return describeClusterResult.nodes().get().size();
    }

    public List<Broker> brokers(String topic, String clusterId) throws ExecutionException, InterruptedException {

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

        Set<String> topicNames;
        if (StringUtils.hasText(topic)) {
            topicNames = new HashSet<>(Collections.singletonList(topic));
        } else {
            topicNames = topicService.topicNames(clusterId);
        }

        Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(topicNames).all().get();
        for (TopicDescription topicDescription : stringTopicDescriptionMap.values()) {
            List<TopicPartitionInfo> partitions = topicDescription.partitions();
            for (TopicPartitionInfo partitionInfo : partitions) {
                Node leader = partitionInfo.leader();
                for (Broker broker : brokers) {
                    if (broker != null && broker.getId() == leader.id()) {
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

        if (StringUtils.hasText(topic)) {
            // 使用topic过滤时只展示相关的broker
            brokers = brokers.stream()
                    .filter(broker -> broker.getFollowerPartitions().size() > 0 || broker.getLeaderPartitions().size() > 0)
                    .collect(Collectors.toList());
        }

        return brokers;
    }
}
