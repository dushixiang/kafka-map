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
    private Long offset;
    private Long logSize;
    private String groupId;
}
