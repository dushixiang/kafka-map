package cn.typesafe.kd.service.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/3/27 7:07 下午
 */
@Data
public class TopicOffset {
    private String topic;
    private int partition;
    private Long consumerOffset;
    private Long beginningOffset;
    private Long endOffset;
    private String groupId;
}
