package cn.typesafe.km.controller;

import cn.typesafe.km.service.ConsumerGroupService;
import cn.typesafe.km.service.dto.ConsumerGroup;
import cn.typesafe.km.service.dto.ConsumerGroupInfo;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/{groupId}")
    public ConsumerGroupInfo info(@PathVariable String groupId, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return consumerGroupService.info(clusterId, groupId);
    }

    @GetMapping("")
    public List<ConsumerGroup> list(@RequestParam String clusterId, String groupId) throws ExecutionException, InterruptedException {
        return consumerGroupService.consumerGroup(clusterId, groupId);
    }

    @DeleteMapping("/{groupId}")
    public void delete(@PathVariable String groupId, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        consumerGroupService.delete(clusterId, groupId);
    }
}
