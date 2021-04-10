package cn.typesafe.kd.service;

import cn.typesafe.kd.config.Constant;
import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.service.dto.ConsumerMessage;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

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

    public List<ConsumerMessage> data(String clusterId, String topicName, Integer tPartition, Long startOffset, int count) {
        try (KafkaConsumer<String, String> kafkaConsumer = clusterService.createConsumer(clusterId)) {

            TopicPartition topicPartition = new TopicPartition(topicName, tPartition);
            List<TopicPartition> topicPartitions = List.of(topicPartition);
            kafkaConsumer.assign(topicPartitions);

            Long beginningOffset = kafkaConsumer.beginningOffsets(topicPartitions).get(topicPartition);
            if (startOffset < beginningOffset) {
                startOffset = beginningOffset;
            }
            kafkaConsumer.seek(topicPartition, startOffset);

            Long endOffset = kafkaConsumer.endOffsets(topicPartitions).get(topicPartition);
            long currentOffset = startOffset - 1;

            final var records = new ArrayList<ConsumerRecord<String, String>>(count);

            var emptyPoll = 0;
            while (records.size() < count && currentOffset < endOffset) {
                var polled = kafkaConsumer.poll(Duration.ofMillis(200)).records(topicPartition);

                if (!CollectionUtils.isEmpty(polled)) {
                    records.addAll(polled);
                    currentOffset = polled.get(polled.size() - 1).offset();
                    emptyPoll = 0;
                } else if (++emptyPoll == 3) {
                    break;
                }
            }

            return records
                    .subList(0, Math.min(count, records.size()))
                    .stream()
                    .map(record -> {
                        int partition = record.partition();
                        long timestamp = record.timestamp();
                        String key = record.key();
                        String value = record.value();
                        long offset = record.offset();

                        ConsumerMessage consumerMessage = new ConsumerMessage();
                        consumerMessage.setTopic(topicName);
                        consumerMessage.setOffset(offset);
                        consumerMessage.setPartition(partition);
                        consumerMessage.setTimestamp(timestamp);
                        consumerMessage.setKey(key);
                        consumerMessage.setValue(value);

                        return consumerMessage;
                    }).collect(Collectors.toList());
        }
    }
}
