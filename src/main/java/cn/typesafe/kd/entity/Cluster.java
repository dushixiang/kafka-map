package cn.typesafe.kd.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;

/**
 * @author dushixiang
 * @date 2021/3/27 9:45 下午
 */
@Table
@Entity
@Data
public class Cluster {

    @Column(length = 36)
    @Id
    private String id;
    private String name;
    private String servers;
    private String controller;
    private Boolean monitor;
    private Integer topicCount;
    private Integer brokerCount;
    private Integer consumerCount;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date created;
}
