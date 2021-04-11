package cn.typesafe.km.repository;

import cn.typesafe.km.entity.Cluster;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author dushixiang
 * @date 2021/3/27 11:14 上午
 */
public interface ClusterRepository extends JpaRepository<Cluster, String> {

}
