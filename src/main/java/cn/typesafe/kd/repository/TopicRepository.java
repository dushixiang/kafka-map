package cn.typesafe.kd.repository;

import cn.typesafe.kd.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @author dushixiang
 * @date 2021/3/27 11:24 上午
 */
public interface TopicRepository extends JpaRepository<Topic, String> {
}
