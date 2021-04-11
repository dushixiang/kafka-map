package cn.typesafe.km.service.dto;

import lombok.Data;

import java.util.Set;

/**
 * @author dushixiang
 * @date 2021/4/11 7:31 下午
 */
@Data
public class ConsumerGroupInfo {
    private String groupId;
    private Set<String> topics;
}
