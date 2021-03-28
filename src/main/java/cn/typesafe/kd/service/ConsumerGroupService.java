package cn.typesafe.kd.service;

import cn.typesafe.kd.repository.ConsumerGroupRepository;
import cn.typesafe.kd.service.dto.TopicOffset;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    @Resource
    private ConsumerGroupRepository consumerGroupRepository;

    public List<TopicOffset> topicOffsets(String clusterId, String groupId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        KafkaConsumer<String, String> kafkaConsumer = clusterService.getConsumer(clusterId);

        Map<TopicPartition, OffsetAndMetadata> topicPartitionOffsetAndMetadataMap = adminClient.listConsumerGroupOffsets(groupId).partitionsToOffsetAndMetadata().get();
        Set<TopicPartition> topicPartitions = topicPartitionOffsetAndMetadataMap.keySet();
        Map<TopicPartition, Long> topicPartitionLongMap = kafkaConsumer.endOffsets(topicPartitions);

        List<TopicOffset> topicOffsetList = topicPartitionOffsetAndMetadataMap.entrySet().stream().map(e -> {
            TopicPartition topicPartition = e.getKey();
            OffsetAndMetadata offsetAndMetadata = e.getValue();
            String topic = topicPartition.topic();
            int partition = topicPartition.partition();
            long offset = offsetAndMetadata.offset();
            Long logSize = topicPartitionLongMap.get(topicPartition);

            TopicOffset topicOffset = new TopicOffset();
            topicOffset.setTopic(topic);
            topicOffset.setPartition(partition);
            topicOffset.setOffset(offset);
            topicOffset.setLogSize(logSize);

            return topicOffset;
        }).collect(Collectors.toList());
        return topicOffsetList;
    }
}
