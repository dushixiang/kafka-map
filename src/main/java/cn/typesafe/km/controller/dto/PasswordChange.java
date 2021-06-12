package cn.typesafe.km.controller.dto;

import lombok.Data;

/**
 * @author dushixiang
 * @date 2021/6/12 5:11 下午
 */
@Data
public class PasswordChange {
    private String oldPassword;
    private String newPassword;
}
