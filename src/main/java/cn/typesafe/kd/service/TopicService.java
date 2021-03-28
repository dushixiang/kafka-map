package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Cluster;
import cn.typesafe.kd.service.dto.Topic;
import cn.typesafe.kd.repository.ClusterRepository;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.clients.admin.TopicDescription;
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
    private ClusterRepository clusterRepository;

    public Set<String> topicNames(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    public List<Topic> topics(String clusterId) throws ExecutionException, InterruptedException {
        List<String> clusterIds;
        if (StringUtils.hasText(clusterId)) {
            clusterIds = Collections.singletonList(clusterId);
        } else {
            clusterIds = clusterRepository.findAll().stream().map(Cluster::getId).collect(Collectors.toList());
        }

        List<Cluster> clusters = clusterRepository.findAllById(clusterIds);

        List<Topic> topics = new ArrayList<>();
        for (Cluster cluster : clusters) {
            String id = cluster.getId();
            AdminClient adminClient = clusterService.getAdminClient(id);
            Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(topicNames(id)).all().get();

            List<Topic> topicList = stringTopicDescriptionMap
                    .entrySet()
                    .stream().map(e -> {
                        Topic topic = new Topic();
                        topic.setClusterId(id);
                        topic.setClusterName(cluster.getName());
                        topic.setName(e.getKey());
                        topic.setPartitionsSize(e.getValue().partitions().size());
                        return topic;
                    })
                    .collect(Collectors.toList());

            topics.addAll(topicList);

            cluster.setTopicCount(topicList.size());
        }
        clusterRepository.saveAll(clusters);
        clusterRepository.flush();

        return topics;
    }
}
