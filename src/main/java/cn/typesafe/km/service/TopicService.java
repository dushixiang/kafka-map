package cn.typesafe.km.service;

import cn.typesafe.km.service.dto.*;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.*;
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
    private BrokerService brokerService;

    public Set<String> topicNames(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    public List<Topic> topics(String clusterId, String name) throws ExecutionException, InterruptedException {

        Set<String> topicNames = topicNames(clusterId);
        if (StringUtils.hasText(name)) {
            topicNames = topicNames
                    .stream()
                    .filter(topic -> topic.toLowerCase().contains(name))
                    .collect(Collectors.toSet());
        }
        return topics(clusterId, topicNames);
    }

    public List<Topic> topics(String clusterId, Set<String> topicNames) throws InterruptedException, ExecutionException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(topicNames).all().get();

        List<Topic> topics = stringTopicDescriptionMap
                .entrySet()
                .stream().map(e -> {
                    Topic topic = new Topic();
                    topic.setClusterId(clusterId);
                    topic.setName(e.getKey());
                    topic.setPartitionsCount(e.getValue().partitions().size());
                    topic.setTotalLogSize(0L);
                    topic.setReplicaCount(0);
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
                            topic.setReplicaCount(topic.getReplicaCount() + 1);
                            topic.setTotalLogSize(topic.getTotalLogSize() + size);
                        }
                    }
                }
            }
        }

        return topics;
    }

    public TopicInfo info(String clusterId, String topicName) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        try (KafkaConsumer<String, String> kafkaConsumer = clusterService.createConsumer(clusterId)) {
            TopicDescription topicDescription = adminClient.describeTopics(Collections.singletonList(topicName)).all().get().get(topicName);
            TopicInfo topicInfo = new TopicInfo();
            topicInfo.setClusterId(clusterId);
            topicInfo.setName(topicName);

            List<TopicPartitionInfo> partitionInfos = topicDescription.partitions();
            int replicaCount = 0;
            for (TopicPartitionInfo topicPartitionInfo : partitionInfos) {
                replicaCount += topicPartitionInfo.replicas().size();
            }
            topicInfo.setReplicaCount(replicaCount);

            List<TopicPartition> topicPartitions = partitionInfos.stream().map(x -> new TopicPartition(topicName, x.partition())).collect(Collectors.toList());
            Map<TopicPartition, Long> beginningOffsets = kafkaConsumer.beginningOffsets(topicPartitions);
            Map<TopicPartition, Long> endOffsets = kafkaConsumer.endOffsets(topicPartitions);

            List<TopicInfo.Partition> partitions = topicPartitions
                    .stream()
                    .map(topicPartition -> {
                        Long beginningOffset = beginningOffsets.get(topicPartition);
                        Long endOffset = endOffsets.get(topicPartition);
                        return new TopicInfo.Partition(topicPartition.partition(), beginningOffset, endOffset);
                    })
                    .collect(Collectors.toList());

            topicInfo.setPartitions(partitions);


            List<Integer> brokerIds = brokerService.brokers(topicName, clusterId).stream().map(Broker::getId).collect(Collectors.toList());
            Map<Integer, Map<String, LogDirDescription>> integerMapMap;
            try {
                integerMapMap = adminClient.describeLogDirs(brokerIds).allDescriptions().get();
                topicInfo.setTotalLogSize(0L);
                for (Map<String, LogDirDescription> descriptionMap : integerMapMap.values()) {
                    for (LogDirDescription logDirDescription : descriptionMap.values()) {
                        Map<TopicPartition, ReplicaInfo> topicPartitionReplicaInfoMap = logDirDescription.replicaInfos();
                        for (Map.Entry<TopicPartition, ReplicaInfo> replicaInfoEntry : topicPartitionReplicaInfoMap.entrySet()) {
                            TopicPartition topicPartition = replicaInfoEntry.getKey();
                            if (!Objects.equals(topicName, topicPartition.topic())) {
                                continue;
                            }
                            ReplicaInfo replicaInfo = replicaInfoEntry.getValue();
                            long size = replicaInfo.size();
                            topicInfo.setTotalLogSize(topicInfo.getTotalLogSize() + size);
                        }
                    }
                }
            } catch (InterruptedException | ExecutionException ignored) {
                topicInfo.setTotalLogSize(-1L);
            }
            return topicInfo;
        }
    }

    public List<Partition> partitions(String topicName, String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        try (KafkaConsumer<String, String> kafkaConsumer = clusterService.createConsumer(clusterId)) {
            Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(Collections.singletonList(topicName)).all().get();
            TopicDescription topicDescription = stringTopicDescriptionMap.get(topicName);

            List<TopicPartitionInfo> partitionInfos = topicDescription.partitions();
            List<TopicPartition> topicPartitions = partitionInfos.stream().map(x -> new TopicPartition(topicName, x.partition())).collect(Collectors.toList());
            Map<TopicPartition, Long> beginningOffsets = kafkaConsumer.beginningOffsets(topicPartitions);
            Map<TopicPartition, Long> endOffsets = kafkaConsumer.endOffsets(topicPartitions);

            Iterator<TopicPartitionInfo> iterator = partitionInfos.iterator();
            List<Partition> partitionArrayList = new ArrayList<>(partitionInfos.size());
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

                for (TopicPartition topicPartition : topicPartitions) {
                    if (partition.getPartition() == topicPartition.partition()) {
                        Long beginningOffset = beginningOffsets.get(topicPartition);
                        Long endOffset = endOffsets.get(topicPartition);
                        partition.setBeginningOffset(beginningOffset);
                        partition.setEndOffset(endOffset);
                        break;
                    }
                }
            }

            List<Integer> brokerIds = brokerService.brokers(topicName, clusterId).stream().map(Broker::getId).collect(Collectors.toList());
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
                                    if (Objects.equals(topicName, topicPartition.topic()) && topicPartition.partition() == partition.getPartition()) {
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
        Map<String, NewPartitions> newPartitionsMap = new HashMap<>();
        newPartitionsMap.put(topic, NewPartitions.increaseTo(totalCount));
        
        adminClient.createPartitions(newPartitionsMap).all().get();
    }

}
