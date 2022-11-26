package cn.typesafe.km.controller;

import cn.typesafe.km.service.BrokerService;
import cn.typesafe.km.service.dto.Broker;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.Resource;
import java.util.List;
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
}
