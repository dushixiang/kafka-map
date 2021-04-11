package cn.typesafe.km.service.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * @author dushixiang
 * @date 2021/4/5 11:29 上午
 */
@Data
public class ResetOffset {
    private int partition;
    @NotBlank
    private String seek;
    private Long offset;
}
