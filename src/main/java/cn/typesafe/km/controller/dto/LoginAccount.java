package cn.typesafe.km.controller.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/6/10 2:38 下午
 */
@Data
public class LoginAccount {
    private String username;
    private String password;
    private Boolean remember;
}
