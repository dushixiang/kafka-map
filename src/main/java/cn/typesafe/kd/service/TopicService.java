package cn.typesafe.kd.service;

import cn.typesafe.kd.entity.Topic;
import cn.typesafe.kd.repository.TopicRepository;
import cn.typesafe.kd.util.Sign;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.ListTopicsResult;
import org.apache.kafka.clients.admin.TopicDescription;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private TopicRepository topicRepository;

    public Set<String> topicNames(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        ListTopicsResult topics = adminClient.listTopics();
        return topics.names().get();
    }

    public List<Topic> topics(String clusterId) throws ExecutionException, InterruptedException {
        AdminClient adminClient = clusterService.getAdminClient(clusterId);
        Map<String, TopicDescription> stringTopicDescriptionMap = adminClient.describeTopics(topicNames(clusterId)).all().get();

        List<Topic> topics = stringTopicDescriptionMap
                .entrySet()
                .stream().map(e -> {

                    Topic topic = new Topic();
                    topic.setId(Sign.sign(e.getKey(), clusterId));
                    topic.setClusterId(clusterId);
                    topic.setName(e.getKey());
                    topic.setPartitionsSize(e.getValue().partitions().size());
                    return topic;
                })
                .collect(Collectors.toList());

        topicRepository.saveAll(topics);
        topicRepository.flush();
        return topics;
    }
}
