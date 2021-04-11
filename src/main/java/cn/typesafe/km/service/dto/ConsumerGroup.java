package cn.typesafe.km.service.dto;

import lombok.Data;

import java.util.Set;

/**
 * @author dushixiang
 * @date 2021/4/2 20:35 下午
 */
@Data
public class ConsumerGroup {
    private String groupId;
    private Long lag;
    private Set<String> topics;
}
