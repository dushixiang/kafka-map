package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.service.dto.ConsumerGroup;
import cn.typesafe.kd.service.dto.ResetOffset;
import cn.typesafe.kd.service.dto.TopicOffset;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ConsumerGroupListing;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * @author dushixiang
 * @date 2021/3/27 6:10 下午
 */
@Service
public class ConsumerGroupService {

    @Resource
    private ClusterService clusterService;

    public List<TopicOffset> topicOffsets(String clusterId, String groupId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        KafkaConsumer<String, String> kafkaConsumer = clusterService.getConsumer(clusterId);

        Map<TopicPartition, OffsetAndMetadata> topicPartitionOffsetAndMetadataMap = adminClient.listConsumerGroupOffsets(groupId).partitionsToOffsetAndMetadata().get();
        Set<TopicPartition> topicPartitions = topicPartitionOffsetAndMetadataMap.keySet();
        Map<TopicPartition, Long> topicPartitionLongMap = kafkaConsumer.endOffsets(topicPartitions);

        return topicPartitionOffsetAndMetadataMap.entrySet().stream().map(e -> {
            TopicPartition topicPartition = e.getKey();
            OffsetAndMetadata offsetAndMetadata = e.getValue();
            String topic = topicPartition.topic();
            int partition = topicPartition.partition();
            long offset = offsetAndMetadata.offset();
            Long logSize = topicPartitionLongMap.get(topicPartition);

            TopicOffset topicOffset = new TopicOffset();
            topicOffset.setGroupId(groupId);
            topicOffset.setTopic(topic);
            topicOffset.setPartition(partition);
            topicOffset.setOffset(offset);
            topicOffset.setLogSize(logSize);

            return topicOffset;
        }).collect(Collectors.toList());
    }

    public List<ConsumerGroup> consumerGroups(String topic, String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);

        Collection<ConsumerGroupListing> consumerGroupListings = adminClient.listConsumerGroups().all().get();
        List<ConsumerGroup> consumerGroups = new ArrayList<>();
        for (ConsumerGroupListing consumerGroupListing : consumerGroupListings) {
            String groupId = consumerGroupListing.groupId();
            Map<TopicPartition, OffsetAndMetadata> topicPartitionOffsetAndMetadataMap = adminClient.listConsumerGroupOffsets(groupId)
                    .partitionsToOffsetAndMetadata()
                    .get();
            Set<TopicPartition> topicPartitions = topicPartitionOffsetAndMetadataMap.keySet();
            topicPartitions.stream()
                    .filter(topicPartition -> Objects.equals(topicPartition.topic(), topic))
                    .findAny()
                    .ifPresent(topicPartition -> {
                        ConsumerGroup consumerGroup = new ConsumerGroup();
                        consumerGroup.setGroupId(groupId);
                        consumerGroup.setSimpleConsumerGroup(consumerGroupListing.isSimpleConsumerGroup());
                        consumerGroups.add(consumerGroup);
                    });
        }
        return consumerGroups;
    }

    public List<TopicOffset> offset(String topic, String groupId, String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        KafkaConsumer<String, String> kafkaConsumer = clusterService.getConsumer(clusterId);

        Map<TopicPartition, OffsetAndMetadata> topicPartitionOffsetAndMetadataMap = adminClient.listConsumerGroupOffsets(groupId)
                .partitionsToOffsetAndMetadata()
                .get();
        Set<TopicPartition> topicPartitions = topicPartitionOffsetAndMetadataMap.keySet();
        Map<TopicPartition, Long> topicPartitionLongMap = kafkaConsumer.endOffsets(topicPartitions);
        List<TopicOffset> topicOffsets = new ArrayList<>();

        topicPartitions.stream()
                .filter(topicPartition -> Objects.equals(topicPartition.topic(), topic))
                .forEachOrdered(topicPartition -> {
                    int partition = topicPartition.partition();
                    OffsetAndMetadata offsetAndMetadata = topicPartitionOffsetAndMetadataMap.get(topicPartition);
                    Long logSize = topicPartitionLongMap.get(topicPartition);
                    long offset = offsetAndMetadata.offset();

                    TopicOffset topicOffset = new TopicOffset();
                    topicOffset.setGroupId(groupId);
                    topicOffset.setTopic(topic);
                    topicOffset.setPartition(partition);
                    topicOffset.setOffset(offset);
                    topicOffset.setLogSize(logSize);
                    topicOffsets.add(topicOffset);
                });
        return topicOffsets;
    }

    public void resetOffset(String topic, String groupId, String clusterId, ResetOffset resetOffset) {
        Cluster cluster = clusterService.findById(clusterId);
        KafkaConsumer<String, String> kafkaConsumer = null;
        try {
            kafkaConsumer = clusterService.createConsumer(cluster.getServers(), groupId);
            TopicPartition topicPartition = new TopicPartition(topic, resetOffset.getPartition());
            List<TopicPartition> topicPartitions = Collections.singletonList(topicPartition);

            kafkaConsumer.assign(topicPartitions);
            if (Objects.equals("beginning", resetOffset.getSeek())) {
                kafkaConsumer.seek(topicPartition, 0);
            } else if (Objects.equals("end", resetOffset.getSeek())) {
                Map<TopicPartition, Long> topicPartitionLongMap = kafkaConsumer.endOffsets(topicPartitions);
                Long logSize = topicPartitionLongMap.get(topicPartition);
                kafkaConsumer.seek(topicPartition, logSize);
            } else {
                kafkaConsumer.seek(topicPartition, resetOffset.getOffset());
            }
            kafkaConsumer.commitSync();
        } finally {
            if (kafkaConsumer != null) {
                kafkaConsumer.close();
            }
        }
    }
}
