package cn.typesafe.km.controller;

import cn.typesafe.km.service.BrokerService;
import cn.typesafe.km.service.ConsumerGroupService;
import cn.typesafe.km.service.MessageService;
import cn.typesafe.km.service.dto.*;
import cn.typesafe.km.service.TopicService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutionException;

/**
 * @author dushixiang
 * @date 2021/3/27 20:02
 */
@RequestMapping("/topics")
@RestController
public class TopicController {

    @Resource
    private TopicService topicService;
    @Resource
    private BrokerService brokerService;
    @Resource
    private ConsumerGroupService consumerGroupService;
    @Resource
    private MessageService messageService;

    @GetMapping("/names")
    public Set<String> topicNames(@RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return topicService.topicNames(clusterId);
    }

    @GetMapping("")
    public List<Topic> topics(@RequestParam String clusterId, String name) throws ExecutionException, InterruptedException {
        return topicService.topics(clusterId, name);
    }

    @PostMapping("")
    public void create(@RequestBody TopicForCreate topic) throws ExecutionException, InterruptedException {
        topicService.createTopic(topic);
    }

    @PostMapping("/batch-delete")
    public void delete(@RequestBody ArrayList<String> topics, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        topicService.deleteTopic(clusterId, topics);
    }

    @GetMapping("/{topic}")
    public TopicInfo info(@PathVariable String topic, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return topicService.info(clusterId, topic);
    }

    @GetMapping("/{topic}/partitions")
    public List<Partition> partitions(@PathVariable String topic, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return topicService.partitions(topic, clusterId);
    }

    @GetMapping("/{topic}/brokers")
    public List<Broker> brokers(@PathVariable String topic, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return brokerService.brokers(topic, clusterId);
    }

    @GetMapping("/{topic}/consumerGroups")
    public List<ConsumerGroup> consumerGroups(@PathVariable String topic, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return consumerGroupService.consumerGroups(topic, clusterId);
    }

    @GetMapping("/{topic}/consumerGroups/{groupId}/offset")
    public List<TopicOffset> offset(@PathVariable String topic, @PathVariable String groupId, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return consumerGroupService.offset(topic, groupId, clusterId);
    }

    @PutMapping("/{topic}/consumerGroups/{groupId}/offset")
    public void resetOffset(@PathVariable String topic, @PathVariable String groupId, @RequestParam String clusterId, @RequestBody ResetOffset resetOffset) throws ExecutionException, InterruptedException {
        consumerGroupService.resetOffset(topic, groupId, clusterId, resetOffset);
    }

    @PostMapping("/{topic}/partitions")
    public void createPartitions(@PathVariable String topic, @RequestParam String clusterId, @RequestParam Integer totalCount) throws ExecutionException, InterruptedException {
        topicService.createPartitions(clusterId, topic, totalCount);
    }

    @GetMapping("/{topic}/data")
    public List<ConsumerMessage> data(@PathVariable String topic, @RequestParam String clusterId,
                                      @RequestParam(defaultValue = "0") Integer partition,
                                      @RequestParam(defaultValue = "0") Long offset,
                                      @RequestParam(defaultValue = "100") Integer count,
                                      String keyFilter,
                                      String valueFilter) {
        return messageService.data(clusterId, topic, partition, offset, count, keyFilter, valueFilter);
    }
}
