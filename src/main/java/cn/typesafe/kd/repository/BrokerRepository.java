package cn.typesafe.kd.repository;

import cn.typesafe.kd.entity.Broker;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author dushixiang
 * @date 2021/3/27 11:25 上午
 */
public interface BrokerRepository extends JpaRepository<Broker, String> {
}
