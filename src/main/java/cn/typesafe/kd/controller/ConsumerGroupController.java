package cn.typesafe.kd.controller;

import cn.typesafe.kd.service.ConsumerGroupService;
import cn.typesafe.kd.service.dto.TopicOffset;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;
import java.util.concurrent.ExecutionException;

/**
 * @author dushixiang
 * @date 2021/3/27 7:11 下午
 */
@RequestMapping("/consumerGroups")
@RestController
public class ConsumerGroupController {

    @Resource
    private ConsumerGroupService consumerGroupService;

    @GetMapping("")
    public List<TopicOffset> topicOffsets(String clusterId, String groupId) throws ExecutionException, InterruptedException {
        return consumerGroupService.topicOffsets(clusterId, groupId);
    }
}
