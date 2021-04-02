package cn.typesafe.kd.controller;

import cn.typesafe.kd.service.BrokerService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

/**
 * @author dushixiang
 * @date 2021/4/2 20:42 下午
 */
@RequestMapping("/brokers")
@RestController
public class BrokerController {

    @Resource
    private BrokerService brokerService;

    public void brokers(){
//        brokerService.brokers()
    }
}
