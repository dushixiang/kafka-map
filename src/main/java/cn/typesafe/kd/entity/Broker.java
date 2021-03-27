package cn.typesafe.kd.entity;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * @author dushixiang
 * @date 2021/3/27 11:21 上午
 */
@Table
@Entity
@Data
public class Broker {
    @Column(length = 36)
    @Id
    private String id;
    @Column(length = 36)
    private String clusterId;

}
