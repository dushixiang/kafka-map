package cn.typesafe.km.entity;

import lombok.Data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * @author dushixiang
 * @date 2021/6/10 1:11 下午
 */
@Table
@Entity
@Data
public class User {
    @Column(length = 36)
    @Id
    private String id;
    @Column(length = 100, nullable = false, unique = true)
    private String username;
    @Column(length = 300)
    private String password;
}
