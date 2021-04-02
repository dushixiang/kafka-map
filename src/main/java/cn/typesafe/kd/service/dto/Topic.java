package cn.typesafe.kd.service.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/3/27 12:03 下午
 */
@Data
public class Topic {
    private String clusterId;
    private String name;
    private Integer partitionsSize;
    private Integer consumerGroupSize;
}
