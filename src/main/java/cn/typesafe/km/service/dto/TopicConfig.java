package cn.typesafe.km.service.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/4/24 3:20 下午
 */
@Data
public class TopicConfig {
    private String name;
    private String value;
    private boolean _default;
    private boolean readonly;
    private boolean sensitive;
}
