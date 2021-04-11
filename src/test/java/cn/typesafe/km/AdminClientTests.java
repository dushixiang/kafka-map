package cn.typesafe.km;

import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.KafkaFuture;
import org.apache.kafka.common.Node;
import org.apache.kafka.common.TopicPartition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@SpringBootTest
class AdminClientTests {

    private AdminClient adminClient;

    @BeforeEach
    void initKafka() {
        Properties properties = new Properties();
        properties.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "10.1.5.84:9094");
        properties.put(AdminClientConfig.REQUEST_TIMEOUT_MS_CONFIG, "5000");
        adminClient = AdminClient.create(properties);
    }

    @Test
    public void testListTopicNames() throws InterruptedException, ExecutionException {
        ListTopicsResult topics = adminClient.listTopics();
        KafkaFuture<Set<String>> names = topics.names();
        System.out.println(names.get());
    }

    @Test
    public void testListTopics() throws ExecutionException, InterruptedException {
        ListTopicsResult listTopicsResult = adminClient.listTopics();
        Collection<TopicListing> topicListings = listTopicsResult.listings().get();
        for (TopicListing topicListing : topicListings) {
            System.out.println(topicListing.toString());
        }
    }

    @Test
    public void testTopicPartitions() throws ExecutionException, InterruptedException {
        ListTopicsResult topics = adminClient.listTopics();
        Set<String> topicNames = topics.names().get();
        Map<String, TopicDescription> descriptionMap = adminClient.describeTopics(topicNames).all().get();
        descriptionMap.forEach((topicName, topicDescription) -> {
            System.out.println(topicName + " : " + topicDescription.partitions().size());
        });
    }

    @Test
    public void testCreateTopic() throws ExecutionException, InterruptedException {
        int partitions = 1;
        short replicationFactor = 2;

        NewTopic newTopic = new NewTopic("ddd", partitions, replicationFactor);
        CreateTopicsResult topicsResult = adminClient.createTopics(Collections.singleton(newTopic));
        KafkaFuture<Void> kafkaFuture = topicsResult.all();
        kafkaFuture.get();
    }

    @Test
    public void testDeleteTopic() throws ExecutionException, InterruptedException {
        DeleteTopicsResult topicsResult = adminClient.deleteTopics(Collections.singleton("ddd"));
        KafkaFuture<Void> all = topicsResult.all();
        all.get();
    }

    @Test
    public void testDescribeCluster() throws ExecutionException, InterruptedException {
        DescribeClusterResult describeClusterResult = adminClient.describeCluster();
        System.out.println("clusterId: " + describeClusterResult.clusterId().get());
        System.out.println("controller: " + describeClusterResult.controller().get());
    }

    @Test
    public void testListBrokers() throws ExecutionException, InterruptedException {
        DescribeClusterResult describeClusterResult = adminClient.describeCluster();
        Collection<Node> clusterDetails = describeClusterResult.nodes().get();
        for (Node clusterDetail : clusterDetails) {
            System.out.println(clusterDetail.toString());
        }
    }

    @Test
    public void testListConsumerGroups() throws ExecutionException, InterruptedException {
        KafkaFuture<Collection<ConsumerGroupListing>> collectionKafkaFuture = adminClient.listConsumerGroups().all();
        Collection<ConsumerGroupListing> consumerGroupListings = collectionKafkaFuture.get();
        for (ConsumerGroupListing consumerGroupListing : consumerGroupListings) {
            System.out.println(consumerGroupListing.toString());
        }
    }

    @Test
    public void testLogSize() throws ExecutionException, InterruptedException {
        Collection<ConsumerGroupListing> consumerGroupListings = adminClient.listConsumerGroups().all().get();
        for (ConsumerGroupListing consumerGroupListing : consumerGroupListings) {
            ListConsumerGroupOffsetsResult listConsumerGroupOffsetsResult = adminClient.listConsumerGroupOffsets(consumerGroupListing.groupId());

            Map<TopicPartition, OffsetAndMetadata> topicPartitionOffsetAndMetadataMap = listConsumerGroupOffsetsResult.partitionsToOffsetAndMetadata().get();

            System.out.println(consumerGroupListing.groupId());
            topicPartitionOffsetAndMetadataMap.forEach((topicPartition, offsetAndMetadata) -> {
                System.out.println("\t " + topicPartition.topic() + " " + topicPartition.partition() + " " + offsetAndMetadata.offset());
            });
        }
    }

    @Test
    public void test() throws ExecutionException, InterruptedException {

        Collection<ConsumerGroupListing> consumerGroupListings = adminClient.listConsumerGroups().all().get();

        List<String> groupIdList = consumerGroupListings.stream().map(ConsumerGroupListing::groupId).collect(Collectors.toList());

        Map<String, ConsumerGroupDescription> groupDescriptionMap = adminClient.describeConsumerGroups(groupIdList).all().get();

        groupDescriptionMap.forEach((s, consumerGroupDescription) -> {
            System.out.println(s + " : " + consumerGroupDescription.toString());
        });
    }

    @Test
    public void testCreatePartitions() throws ExecutionException, InterruptedException {
        Map<String, NewPartitions> newPartitionsMap = Map.of("ddd", NewPartitions.increaseTo(1));
        adminClient.createPartitions(newPartitionsMap).all().get();
    }
}
