package cn.typesafe.km.controller;

import cn.typesafe.km.service.BrokerService;
import cn.typesafe.km.service.dto.Broker;
import cn.typesafe.km.service.dto.ServerConfig;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.Resource;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

/**
 * @author dushixiang
 * @date 2021/4/2 20:42 下午
 */
@RequestMapping("/brokers")
@RestController
public class BrokerController {

    @Resource
    private BrokerService brokerService;

    @GetMapping("")
    public List<Broker> brokers(@RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return brokerService.brokers(null, clusterId);
    }

    @GetMapping("/{id}/configs")
    public List<ServerConfig> configs(@PathVariable String id, @RequestParam String clusterId) throws ExecutionException, InterruptedException {
        return brokerService.getConfigs(id, clusterId);
    }

    @PutMapping("/{id}/configs")
    public void updateConfigs(@PathVariable String id, @RequestParam String clusterId, @RequestBody Map<String, String> configs) throws ExecutionException, InterruptedException {
        brokerService.setConfigs(id, clusterId, configs);
    }
}
