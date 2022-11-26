package cn.typesafe.km.service;

import cn.typesafe.km.entity.Cluster;
import cn.typesafe.km.service.dto.ConsumerMessage;
import cn.typesafe.km.service.dto.LiveMessage;
import cn.typesafe.km.service.dto.TopicData;
import lombok.SneakyThrows;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Flux;

import jakarta.annotation.Resource;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author dushixiang
 * @date 2021/4/10 0:59
 */
@Service
public class MessageService {

    @Resource
    private ClusterService clusterService;

    public List<ConsumerMessage> data(String clusterId, String topicName, Integer tPartition, Long startOffset, int count, String keyFilter, String valueFilter) {
        try (KafkaConsumer<String, String> kafkaConsumer = clusterService.createConsumer(clusterId)) {

            TopicPartition topicPartition = new TopicPartition(topicName, tPartition);
            List<TopicPartition> topicPartitions = Collections.singletonList(topicPartition);
            kafkaConsumer.assign(topicPartitions);

            Long beginningOffset = kafkaConsumer.beginningOffsets(topicPartitions).get(topicPartition);
            if (startOffset < beginningOffset) {
                startOffset = beginningOffset;
            }
            kafkaConsumer.seek(topicPartition, startOffset);

            Long endOffset = kafkaConsumer.endOffsets(topicPartitions).get(topicPartition);
            long currentOffset = startOffset - 1;

            List<ConsumerRecord<String, String>> records = new ArrayList<>(count);

            int emptyPoll = 0;
            while (records.size() < count && currentOffset < endOffset) {
                List<ConsumerRecord<String, String>> polled = kafkaConsumer.poll(Duration.ofMillis(200)).records(topicPartition);

                if (!CollectionUtils.isEmpty(polled)) {

                    for (ConsumerRecord<String, String> consumerRecord : polled) {
                        if (StringUtils.hasText(keyFilter)) {
                            String key = consumerRecord.key();
                            if (StringUtils.hasText(key) && key.toLowerCase().contains(keyFilter.toLowerCase())) {
                                records.add(consumerRecord);
                            }
                            continue;
                        }

                        if (StringUtils.hasText(valueFilter)) {
                            String value = consumerRecord.value();
                            if (StringUtils.hasText(value) && value.toLowerCase().contains(valueFilter.toLowerCase())) {
                                records.add(consumerRecord);
                            }
                            continue;
                        }
                        records.add(consumerRecord);
                    }
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

    @SneakyThrows
    public long sendData(String clusterId, String topic, TopicData topicData) {
        Cluster cluster = clusterService.findById(clusterId);
        KafkaProducer<String, String> kafkaProducer = clusterService.createProducer(cluster.getServers(), cluster.getSecurityProtocol(), cluster.getSaslMechanism(), cluster.getAuthUsername(), cluster.getAuthPassword());
        ProducerRecord<String, String> producerRecord = new ProducerRecord<>(topic, topicData.getPartition(), topicData.getKey(), topicData.getValue());
        RecordMetadata recordMetadata = kafkaProducer.send(producerRecord).get();
        return recordMetadata.offset();
    }

    public Flux<ServerSentEvent<LiveMessage>> liveData(String clusterId, String topicName, Integer tPartition, String keyFilter, String valueFilter) {

        KafkaConsumer<String, String> kafkaConsumer = clusterService.createConsumer(clusterId);
        TopicPartition topicPartition = new TopicPartition(topicName, tPartition);
        List<TopicPartition> topicPartitions = Collections.singletonList(topicPartition);
        kafkaConsumer.assign(topicPartitions);

        Long endOffset = kafkaConsumer.endOffsets(topicPartitions).get(topicPartition);
        kafkaConsumer.seek(topicPartition, endOffset);

        return Flux
            .interval(Duration.ofSeconds(1))
            .doFinally(x -> {
                kafkaConsumer.close();
            })
            .map(sequence -> {

                List<ConsumerRecord<String, String>> records = new ArrayList<>();

                List<ConsumerRecord<String, String>> polled = kafkaConsumer.poll(Duration.ofMillis(200)).records(topicPartition);

                if (!CollectionUtils.isEmpty(polled)) {

                    for (ConsumerRecord<String, String> consumerRecord : polled) {
                        if (StringUtils.hasText(keyFilter)) {
                            String key = consumerRecord.key();
                            if (StringUtils.hasText(key) && key.toLowerCase().contains(keyFilter.toLowerCase())) {
                                records.add(consumerRecord);
                            }
                            continue;
                        }

                        if (StringUtils.hasText(valueFilter)) {
                            String value = consumerRecord.value();
                            if (StringUtils.hasText(value) && value.toLowerCase().contains(valueFilter.toLowerCase())) {
                                records.add(consumerRecord);
                            }
                            continue;
                        }
                        records.add(consumerRecord);
                    }
                }

                List<ConsumerMessage> data = records
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

                Long currBeginningOffset = kafkaConsumer.beginningOffsets(topicPartitions).get(topicPartition);
                Long currEndOffset = kafkaConsumer.endOffsets(topicPartitions).get(topicPartition);

                LiveMessage liveMessage = new LiveMessage();
                liveMessage.setBeginningOffset(currBeginningOffset);
                liveMessage.setEndOffset(currEndOffset);
                liveMessage.setPartition(tPartition);
                liveMessage.setMessages(data);

                return ServerSentEvent.<LiveMessage>builder()
                    .id(String.valueOf(sequence))
                    .event("topic-message-event")
                    .data(liveMessage)
                    .build();
            });
    }
}
