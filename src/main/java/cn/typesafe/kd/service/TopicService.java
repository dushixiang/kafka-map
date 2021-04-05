package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.service.dto.Partition;
import cn.typesafe.kd.service.dto.Topic;
import cn.typesafe.kd.repository.ClusterRepository;
import cn.typesafe.kd.service.dto.TopicForCreate;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.KafkaFuture;
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
 * @date 2021/3/27 12:22
 */
@Service
public class TopicService {
    @Resource
    private ClusterService clusterService;
    @Resource
    private ClusterRepository clusterRepository;

    public Set<String> topicNames(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    public List<Topic> topics(String clusterId, String name) throws ExecutionException, InterruptedException {
        List<String> clusterIds;
        if (StringUtils.hasText(clusterId)) {
            clusterIds = Collections.singletonList(clusterId);
        } else {
            clusterIds = clusterRepository.findAll().stream().map(Cluster::getId).collect(Collectors.toList());
        }

        List<Topic> topics = new ArrayList<>();
        for (String id : clusterIds) {
            AdminClient adminClient = clusterService.getAdminClient(id);
            Set<String> topicNames = topicNames(id);
            if (StringUtils.hasText(name)) {
                topicNames = topicNames
                        .stream()
                        .filter(topic -> topic.toLowerCase().contains(name))
                        .collect(Collectors.toSet());
            }
            Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(topicNames).all().get();

            List<Topic> topicList = stringTopicDescriptionMap
                    .entrySet()
                    .stream().map(e -> {
                        Topic topic = new Topic();
                        topic.setClusterId(id);
                        topic.setName(e.getKey());
                        topic.setPartitionsSize(e.getValue().partitions().size());
                        return topic;
                    })
                    .collect(Collectors.toList());

            topics.addAll(topicList);
        }
        return topics;
    }

    public List<Partition> partitions(String topic, String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(Collections.singletonList(topic)).all().get();
        TopicDescription topicDescription = stringTopicDescriptionMap.get(topic);

        List<TopicPartitionInfo> partitions = topicDescription.partitions();
        Iterator<TopicPartitionInfo> iterator = partitions.iterator();
        List<Partition> partitionArrayList = new ArrayList<>(partitions.size());
        while (iterator.hasNext()) {
            TopicPartitionInfo partitionInfo = iterator.next();
            Node leader = partitionInfo.leader();
            List<Partition.Node> isr = partitionInfo.isr().stream().map(node -> new Partition.Node(node.id(), node.host(), node.port())).collect(Collectors.toList());
            List<Partition.Node> replicas = partitionInfo.replicas().stream().map(node -> new Partition.Node(node.id(), node.host(), node.port())).collect(Collectors.toList());

            Partition partition = new Partition();
            partition.setPartition(partitionInfo.partition());
            partition.setLeader(new Partition.Node(leader.id(), leader.host(), leader.port()));
            partition.setIsr(isr);
            partition.setReplicas(replicas);

            partitionArrayList.add(partition);
        }

        return partitionArrayList;
    }

    public void createTopic(TopicForCreate topic) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(topic.getClusterId());
        NewTopic newTopic = new NewTopic(topic.getName(), topic.getNumPartitions(), topic.getReplicationFactor());
        CreateTopicsResult topicsResult = adminClient.createTopics(Collections.singleton(newTopic));
        KafkaFuture<Void> kafkaFuture = topicsResult.all();
        kafkaFuture.get();
    }

    public void deleteTopic(String clusterId, List<String> topics) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        DeleteTopicsResult topicsResult = adminClient.deleteTopics(topics);
        KafkaFuture<Void> all = topicsResult.all();
        all.get();
    }

    public void createPartitions(String clusterId, String topic, int totalCount) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        Map<String, NewPartitions> newPartitionsMap = Map.of(topic, NewPartitions.increaseTo(totalCount));
        adminClient.createPartitions(newPartitionsMap).all().get();
    }
}
