package cn.typesafe.km.service.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/4/10 0:56
 */
@Data
public class ConsumerMessage {
    private String topic;
    private int partition;
    private Long offset;
    private Long timestamp;
    private String key;
    private String value;
}
