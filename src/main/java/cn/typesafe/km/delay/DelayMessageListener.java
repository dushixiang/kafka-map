package cn.typesafe.km.delay;

import cn.typesafe.km.util.Json;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Properties;


@Slf4j
public class DelayMessageListener implements Runnable {

    private final KafkaConsumer<String, String> consumer;
    private final KafkaProducer<String, String> producer;
    private volatile boolean running = true;
    private final List<String> levelTopics;

    public DelayMessageListener(String servers, String groupId, List<String> levelTopics) {
        this.levelTopics = levelTopics;
        this.consumer = createConsumer(servers, groupId);
        this.producer = createProducer(servers);
    }

    private KafkaConsumer<String, String> createConsumer(String servers, String groupId) {
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.ISOLATION_LEVEL_CONFIG, "read_committed");
        props.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, "5000");
        return new KafkaConsumer<>(props, new StringDeserializer(), new StringDeserializer());
    }

    private KafkaProducer<String, String> createProducer(String servers) {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        return new KafkaProducer<>(props);
    }

    @Override
    public void run() {
        consumer.subscribe(Collections.singletonList("delay-message"));
        do {
            ConsumerRecords<String, String> consumerRecords = consumer.poll(Duration.ofMillis(200));
            for (ConsumerRecord<String, String> consumerRecord : consumerRecords) {
                String value = consumerRecord.value();
                log.debug("pulled delay message: {}", value);
                try {
                    DelayMessage delayMessage = Json.toJavaObject(value, DelayMessage.class);
                    if (delayMessage.getLevel() < 0 || delayMessage.getLevel() >= levelTopics.size()) {
                        ProducerRecord<String, String> record = new ProducerRecord<>(delayMessage.getTopic(), delayMessage.getKey(), delayMessage.getValue());
                        producer.send(record);
                        log.debug("send normal message to user topic: {}", delayMessage.getTopic());
                    } else {
                        String internalDelayTopic = levelTopics.get(delayMessage.getLevel());
                        ProducerRecord<String, String> record = new ProducerRecord<>(internalDelayTopic, null, value);
                        producer.send(record);
                        log.debug("send delay message to internal topic: {}", internalDelayTopic);
                    }
                } catch (Exception e) {
                    log.error("解析消息失败", e);
                }
            }
        } while (running);
    }

    public void shutdown() {
        this.running = false;
    }
}
