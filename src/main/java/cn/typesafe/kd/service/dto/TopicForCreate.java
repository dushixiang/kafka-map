package cn.typesafe.kd.service.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * @author dushixiang
 * @date 2021/4/2 20:11 下午
 */
@Data
public class TopicForCreate {
    private String clusterId;
    /**
     * topic名称
     */
    @NotBlank
    private String name;
    /**
     * 分区数量
     */
    @Size(min = 1)
    private int numPartitions;
    /**
     * 副本数量
     */
    @Size(min = 1)
    private short replicationFactor;
}
