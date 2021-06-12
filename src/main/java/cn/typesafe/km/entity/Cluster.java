package cn.typesafe.km.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.persistence.*;
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
    @Column(length = 200)
    private String name;
    @Column(length = 500)
    private String servers;
    private String controller;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date created;

    @Transient
    private Integer topicCount;
    @Transient
    private Integer brokerCount;
    @Transient
    private Integer consumerCount;
}
