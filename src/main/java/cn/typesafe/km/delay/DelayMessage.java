package cn.typesafe.km.delay;

import lombok.Data;

@Data
public class DelayMessage {
    // 消息级别，共18个
    private int level;
    // 目标消息主题
    private String topic;
    // 目标消息key
    private String key;
    // 目标消息value
    private String value;
}
