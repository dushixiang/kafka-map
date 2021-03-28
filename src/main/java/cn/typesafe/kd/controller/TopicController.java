package cn.typesafe.kd.controller;

import cn.typesafe.kd.service.dto.Topic;
import cn.typesafe.kd.service.TopicService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutionException;

/**
 * @author dushixiang
 * @date 2021/3/27 12:02
 */
@RequestMapping("/topics")
@RestController
public class TopicController {

    @Resource
    private TopicService topicService;

    @GetMapping("/names")
    public Set<String> topicNames(@RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return topicService.topicNames(clusterId);
    }

    @GetMapping("")
    public List<Topic> topics(String clusterId) throws ExecutionException, InterruptedException {
        return topicService.topics(clusterId);
    }
}
