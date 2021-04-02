package cn.typesafe.kd.service.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * @author dushixiang
 * @date 2021/4/2 20:41 下午
 */
@Data
public class Broker {
    private int id;
    private String host;
    private int port;
    private List<Integer> leaderPartitions = new ArrayList<>();
    private List<Integer> followerPartitions = new ArrayList<>();
}
