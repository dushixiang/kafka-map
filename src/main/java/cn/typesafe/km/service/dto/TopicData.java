package cn.typesafe.km.service.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/6/7 9:56 下午
 */
@Data
public class TopicData {
    private int partition;
    private String key;
    private String value;
}
