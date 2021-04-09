package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.repository.ClusterRepository;
import cn.typesafe.kd.service.dto.*;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.time.Duration;
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
    private BrokerService brokerService;
    @Resource
    private ClusterRepository clusterRepository;

    public Set<String> topicNames(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    public List<Topic> topics(String clusterId, String name) throws ExecutionException, InterruptedException {

        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        Set<String> topicNames = topicNames(clusterId);
        if (StringUtils.hasText(name)) {
            topicNames = topicNames
                    .stream()
                    .filter(topic -> topic.toLowerCase().contains(name))
                    .collect(Collectors.toSet());
        }
        Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(topicNames).all().get();

        List<Topic> topics = stringTopicDescriptionMap
                .entrySet()
                .stream().map(e -> {
                    Topic topic = new Topic();
                    topic.setClusterId(clusterId);
                    topic.setName(e.getKey());
                    topic.setPartitionsSize(e.getValue().partitions().size());
                    topic.setTotalLogSize(0L);
                    topic.setReplicaSize(0);
                    return topic;
                })
                .collect(Collectors.toList());

        List<Integer> brokerIds = brokerService.brokers(null, clusterId).stream().map(Broker::getId).collect(Collectors.toList());
        Map<Integer, Map<String, LogDirDescription>> integerMapMap = null;
        try {
            integerMapMap = adminClient.describeLogDirs(brokerIds).allDescriptions().get();
        } catch (InterruptedException | ExecutionException ignored) {
            for (Topic topic : topics) {
                topic.setTotalLogSize(-1L);
            }
        }

        if (integerMapMap != null) {
            for (Topic topic : topics) {
                for (Map<String, LogDirDescription> descriptionMap : integerMapMap.values()) {
                    for (LogDirDescription logDirDescription : descriptionMap.values()) {
                        Map<TopicPartition, ReplicaInfo> topicPartitionReplicaInfoMap = logDirDescription.replicaInfos();
                        for (Map.Entry<TopicPartition, ReplicaInfo> replicaInfoEntry : topicPartitionReplicaInfoMap.entrySet()) {
                            TopicPartition topicPartition = replicaInfoEntry.getKey();
                            if (!Objects.equals(topic.getName(), topicPartition.topic())) {
                                continue;
                            }
                            ReplicaInfo replicaInfo = replicaInfoEntry.getValue();
                            long size = replicaInfo.size();
                            topic.setReplicaSize(topic.getReplicaSize() + 1);
                            topic.setTotalLogSize(topic.getTotalLogSize() + size);
                        }
                    }
                }
            }
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

            Partition partition = new Partition();
            partition.setPartition(partitionInfo.partition());
            partition.setLeader(new Partition.Node(leader.id(), leader.host(), leader.port()));

            List<Partition.Node> isr = partitionInfo.isr().stream().map(node -> new Partition.Node(node.id(), node.host(), node.port())).collect(Collectors.toList());
            List<Partition.Node> replicas = partitionInfo.replicas().stream().map(node -> new Partition.Node(node.id(), node.host(), node.port())).collect(Collectors.toList());

            partition.setIsr(isr);
            partition.setReplicas(replicas);

            partitionArrayList.add(partition);
        }

        List<Integer> brokerIds = brokerService.brokers(topic, clusterId).stream().map(Broker::getId).collect(Collectors.toList());
        Map<Integer, Map<String, LogDirDescription>> integerMapMap = null;
        try {
            integerMapMap = adminClient.describeLogDirs(brokerIds).allDescriptions().get();
        } catch (InterruptedException | ExecutionException ignored) {
            for (Partition partition : partitionArrayList) {
                for (Partition.Node replica : partition.getReplicas()) {
                    replica.setLogSize(-1L);
                }
            }
        }
        if (integerMapMap != null) {
            for (Partition partition : partitionArrayList) {
                for (Partition.Node replica : partition.getReplicas()) {
                    Map<String, LogDirDescription> logDirDescriptionMap = integerMapMap.get(replica.getId());
                    if (logDirDescriptionMap != null) {
                        for (LogDirDescription logDirDescription : logDirDescriptionMap.values()) {
                            Map<TopicPartition, ReplicaInfo> topicPartitionReplicaInfoMap = logDirDescription.replicaInfos();
                            for (Map.Entry<TopicPartition, ReplicaInfo> replicaInfoEntry : topicPartitionReplicaInfoMap.entrySet()) {
                                TopicPartition topicPartition = replicaInfoEntry.getKey();
                                if (Objects.equals(topic, topicPartition.topic()) && topicPartition.partition() == partition.getPartition()) {
                                    ReplicaInfo replicaInfo = replicaInfoEntry.getValue();
                                    long size = replicaInfo.size();
                                    replica.setLogSize(replica.getLogSize() + size);
                                }
                            }
                        }
                    }
                }
            }
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
