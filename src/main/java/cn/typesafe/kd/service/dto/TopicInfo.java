package cn.typesafe.kd.service.dto;

import lombok.Data;

import java.util.List;

/**
 * @author dushixiang
 * @date 2021/4/10 3:25 下午
 */
@Data
public class TopicInfo {
    private String clusterId;
    private String name;
    private Integer replicaSize;
    private Long totalLogSize;
    private List<Partition> partitions;

    @Data
    public static class Partition {
        private int partition;
        private long beginningOffset;
        private long endOffset;

        public Partition(int partition, long beginningOffset, long endOffset) {
            this.partition = partition;
            this.beginningOffset = beginningOffset;
            this.endOffset = endOffset;
        }
    }
}
