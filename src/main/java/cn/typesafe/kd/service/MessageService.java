package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.service.dto.ConsumerMessage;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author dushixiang
 * @date 2021/4/10 0:59
 */
@Service
public class MessageService {

    @Resource
    private ClusterService clusterService;

    public List<ConsumerMessage> data(String clusterId, String topic, String offsetResetConfig, int count) {
        Cluster cluster = clusterService.findById(clusterId);
        KafkaConsumer<String, String> kafkaConsumer = clusterService.createConsumer(cluster.getServers(), "kafka-dashboard", offsetResetConfig);
        List<PartitionInfo> partitionInfos = kafkaConsumer.partitionsFor(topic);
        List<TopicPartition> topicPartitions = partitionInfos.stream().map(x -> new TopicPartition(x.topic(), x.partition())).collect(Collectors.toList());
        kafkaConsumer.assign(topicPartitions);
        Map<TopicPartition, Long> endOffsets = kafkaConsumer.endOffsets(topicPartitions);

        for (TopicPartition topicPartition : topicPartitions) {
            long latestOffset = Math.max(0, endOffsets.get(topicPartition) - 1);
            kafkaConsumer.seek(topicPartition, Math.max(0, latestOffset - count));
        }

        int totalCount = count * topicPartitions.size();
        Map<TopicPartition, List<ConsumerRecord<String, String>>> rawRecords
                = topicPartitions.stream().collect(Collectors.toMap(p -> p, p -> new ArrayList<>(count)));

        boolean hasMoreRecord = true;
        while (rawRecords.size() < totalCount && hasMoreRecord) {
            ConsumerRecords<String, String> records = kafkaConsumer.poll(Duration.ofMillis(100));
            hasMoreRecord = false;
            for (TopicPartition partition : records.partitions()) {
                List<ConsumerRecord<String, String>> recordList = records.records(partition);
                if (recordList == null || recordList.isEmpty()) {
                    continue;
                }
                rawRecords.get(partition).addAll(recordList);
                hasMoreRecord = recordList.get(recordList.size() - 1).offset() < endOffsets.get(partition) - 1;
            }
        }
        return rawRecords.values()
                .stream()
                .flatMap(Collection::stream)
                .map(record -> {
                    int partition = record.partition();
                    long timestamp = record.timestamp();
                    String key = record.key();
                    String value = record.value();
                    long offset = record.offset();

                    ConsumerMessage consumerMessage = new ConsumerMessage();
                    consumerMessage.setTopic(topic);
                    consumerMessage.setOffset(offset);
                    consumerMessage.setPartition(partition);
                    consumerMessage.setTimestamp(timestamp);
                    consumerMessage.setKey(key);
                    consumerMessage.setValue(value);

                    return consumerMessage;
                }).collect(Collectors.toList());
    }
}
