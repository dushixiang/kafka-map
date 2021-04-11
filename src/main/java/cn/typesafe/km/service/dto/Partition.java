package cn.typesafe.km.service.dto;

import lombok.Data;

import java.util.List;

/**
 * @author dushixiang
 * @date 2021/4/2 20:32 上午
 */
@Data
public class Partition {
    private int partition;
    private Node leader;
    private List<Node> isr;
    private List<Node> replicas;
    private long beginningOffset;
    private long endOffset;

    @Data
    public static class Node {
        private int id;
        private String host;
        private int port;
        private Long logSize = 0L;

        public Node() {
        }

        public Node(int id, String host, int port) {
            this.id = id;
            this.host = host;
            this.port = port;
        }
    }
}
