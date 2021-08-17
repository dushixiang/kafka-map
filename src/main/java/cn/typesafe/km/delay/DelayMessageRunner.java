package cn.typesafe.km.delay;

import cn.typesafe.km.util.Json;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Slf4j
public class DelayMessageRunner implements Runnable {

    private final KafkaConsumer<String, String> consumer;
    private final KafkaProducer<String, String> producer;
    private final Object lock = new Object();

    private final String topic;
    private final Long delayTime;
    private final Timer timer = new Timer();
    private volatile boolean running = true;

    public DelayMessageRunner(String servers, String groupId, String topic, Long delayTime) {
        this.topic = topic;
        this.delayTime = delayTime;
        this.consumer = createConsumer(servers, groupId);
        this.producer = createProducer(servers);

        consumer.subscribe(Collections.singletonList(topic));

        timer.schedule(new TimerTask() {
            @Override
            public void run() {
                synchronized (lock) {
                    consumer.resume(consumer.paused());
                    lock.notify();
                }
            }
        }, 0, 100);
    }

    private KafkaConsumer<String, String> createConsumer(String servers, String groupId) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest"); // 需要处理早期未到期的数据
        props.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
        props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "5000");
        return new KafkaConsumer<>(props, new StringDeserializer(), new StringDeserializer());
    }

    KafkaProducer<String, String> createProducer(String servers) {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        return new KafkaProducer<>(props);
    }

    public void shutdown() {
        this.timer.cancel();
        this.running = false;
        // 手动唤醒阻塞的线程使其退出循环
        synchronized (lock) {
            this.lock.notify();
        }
    }

    @SneakyThrows
    @Override
    public void run() {
        do {
            synchronized (lock) {
                ConsumerRecords<String, String> consumerRecords = consumer.poll(Duration.ofMillis(200));

                if (consumerRecords.isEmpty()) {
                    lock.wait();
                    continue;
                }

                log.debug("pulled {} messages form {}.", consumerRecords.count(), topic);
                boolean timed = false;
                for (ConsumerRecord<String, String> consumerRecord : consumerRecords) {
                    long timestamp = consumerRecord.timestamp();
                    TopicPartition topicPartition = new TopicPartition(consumerRecord.topic(), consumerRecord.partition());
                    if (timestamp + delayTime < System.currentTimeMillis()) {
                        String value = consumerRecord.value();
                        DelayMessage delayMessage;
                        try {
                            delayMessage = Json.toJavaObject(value, DelayMessage.class);
                        } catch (Exception e) {
                            log.warn("Failed to parse json", e);
                            continue;
                        }
                        String appTopic = delayMessage.getTopic();
                        String appKey = delayMessage.getKey();
                        String appValue = delayMessage.getValue();

                        // send to application topic
                        ProducerRecord<String, String> producerRecord = new ProducerRecord<>(appTopic, appKey, appValue);
                        try {
                            RecordMetadata recordMetadata = producer.send(producerRecord).get();
                            log.debug("send normal message to user topic={}, key={}, value={}, offset={}", appTopic, appKey, appValue, recordMetadata.offset());
                            // success. commit message
                            OffsetAndMetadata offsetAndMetadata = new OffsetAndMetadata(consumerRecord.offset() + 1);
                            HashMap<TopicPartition, OffsetAndMetadata> metadataHashMap = new HashMap<>();
                            metadataHashMap.put(topicPartition, offsetAndMetadata);
                            consumer.commitSync(metadataHashMap);
                        } catch (ExecutionException e) {
                            consumer.pause(Collections.singletonList(topicPartition));
                            consumer.seek(topicPartition, consumerRecord.offset());
                            timed = true;
                            break;
                        }
                    } else {
                        consumer.pause(Collections.singletonList(topicPartition));
                        consumer.seek(topicPartition, consumerRecord.offset());
                        timed = true;
                        break;
                    }
                }

                if (timed) {
                    lock.wait();
                }
            }
        } while (running);

        this.consumer.close();
        log.debug("close internal topic consumer");
        this.producer.close();
        log.debug("close internal topic producer");
    }
}
