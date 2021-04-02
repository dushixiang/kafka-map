package cn.typesafe.kd.service.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/4/2 20:35 下午
 */
@Data
public class ConsumerGroup {
    private String groupId;
    private Boolean simpleConsumerGroup;
}
