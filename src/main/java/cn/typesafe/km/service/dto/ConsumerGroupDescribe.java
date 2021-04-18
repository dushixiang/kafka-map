package cn.typesafe.km.service.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/4/18 10:10 下午
 */
@Data
public class ConsumerGroupDescribe {
    private String groupId;
    private String topic;
    private int partition;
    private long currentOffset;
    private long logBeginningOffset;
    private long logEndOffset;
    private long lag;
    private String consumerId;
    private String host;
    private String clientId;
}
