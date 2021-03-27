package cn.typesafe.kd.cron;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * @author dushixiang
 * @date 2021/3/27 11:17 上午
 */
@Slf4j
@Component
public class ScheduledTask {

    @Scheduled(fixedRate = 1000 * 60)
    public void scheduledTask() {
        System.out.println("任务执行时间：" + LocalDateTime.now());
    }
}
