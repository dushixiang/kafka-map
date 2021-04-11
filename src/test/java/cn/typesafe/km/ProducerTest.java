package cn.typesafe.km;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Properties;

/**
 * @author dushixiang
 * @date 2021/3/27 5:57 下午
 */
public class ProducerTest {

    private KafkaProducer<String, String> producer;

    @BeforeEach
    void initKafka() {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "10.1.5.84:9094");
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
//        props.put(ProducerConfig.ACKS_CONFIG)

        //request.required.acks
        //0, which means that the producer never waits for an acknowledgement from the broker (the same behavior as 0.7). This option provides the lowest latency but the weakest durability guarantees (some data will be lost when a server fails).
        //1, which means that the producer gets an acknowledgement after the leader replica has received the data. This option provides better durability as the client waits until the server acknowledges the request as successful (only messages that were written to the now-dead leader but not yet replicated will be lost).
        //-1, which means that the producer gets an acknowledgement after all in-sync replicas have received the data. This option provides the best durability, we guarantee that no messages will be lost as long as at least one in sync replica remains.
//        props.put("request.required.acks","-1");

        producer = new org.apache.kafka.clients.producer.KafkaProducer<String, String>(props);
    }

    @Test
    public void testProducer() throws InterruptedException {
        for (int i = 0; i < 100_000; i++) {
            String key = String.valueOf(i);
            String data = "{\n" +
                    "                \"id\": \"topsec-taw-10487\",\n" +
                    "                \"ba_id\": \"ba-311001\",\n" +
                    "                \"time\": 1615194406,\n" +
                    "                \"src\": \"192.168.111.108\",\n" +
                    "                \"dst\": \"192.168.100.100\",\n" +
                    "                \"sport\": \"-\",\n" +
                    "                \"dport\": \"-\",\n" +
                    "                \"smac\": \"fa:16:3e:0d:55:85\",\n" +
                    "                \"dmac\": \"68:05:ca:21:d6:e5\",\n" +
                    "                \"snode\": \"-\",\n" +
                    "                \"dnode\": \"-\",\n" +
                    "                \"vlan\": \"247\",\n" +
                    "                \"protocol\": \"-\",\n" +
                    "                \"desc\": \"Hack a tack木马连接操作\",\n" +
                    "                \"device\": \"topsec-taw\",\n" +
                    "                \"project_id\": \"f7756d8f92a440c2bc26be53c6e3f195\",\n" +
                    "                \"replay\": 0,\n" +
                    "                \"cve\": [],\n" +
                    "                \"bid\": [],\n" +
                    "                \"msb\": [],\n" +
                    "                \"cwe\": [],\n" +
                    "            } ";

//            CompletableFuture.runAsync(() -> producer.send(new ProducerRecord<>("iii", key, data)));
            producer.send(new ProducerRecord<>("iii", key, data));
        }

        Thread.sleep(Integer.MAX_VALUE);
    }
}
