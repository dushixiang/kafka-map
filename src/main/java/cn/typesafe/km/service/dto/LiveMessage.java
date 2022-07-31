package cn.typesafe.km.service.dto;

import lombok.Data;

import java.util.List;

@Data
public class LiveMessage {
    private int partition;
    private long beginningOffset;
    private long endOffset;
    private List<ConsumerMessage> messages;
}
