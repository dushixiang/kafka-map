package cn.typesafe.km.delay;

import com.google.common.util.concurrent.ThreadFactoryBuilder;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;


public class DelayMessageHelper {

    private final Map<String, Long> levels = new LinkedHashMap<>();
    private final String servers;
    private final String groupId;
    private ExecutorService executorService;
    private final List<DelayMessageRunner> runners = new ArrayList<>();
    ;
    private DelayMessageListener delayMessageListener;

    public DelayMessageHelper(String servers, String groupId) {
        this.servers = servers;
        this.groupId = groupId;

        levels.put("__delay-seconds-1", 1000L);
        levels.put("__delay-seconds-5", 1000L * 5);
        levels.put("__delay-seconds-10", 1000L * 10);
        levels.put("__delay-seconds-30", 1000L * 30);
        levels.put("__delay-minutes-1", 1000L * 60);
        levels.put("__delay-minutes-2", 1000L * 60 * 2);
        levels.put("__delay-minutes-3", 1000L * 60 * 3);
        levels.put("__delay-minutes-4", 1000L * 60 * 4);
        levels.put("__delay-minutes-5", 1000L * 60 * 5);
        levels.put("__delay-minutes-6", 1000L * 60 * 6);
        levels.put("__delay-minutes-7", 1000L * 60 * 7);
        levels.put("__delay-minutes-8", 1000L * 60 * 8);
        levels.put("__delay-minutes-9", 1000L * 60 * 9);
        levels.put("__delay-minutes-10", 1000L * 60 * 10);
        levels.put("__delay-minutes-20", 1000L * 60 * 20);
        levels.put("__delay-minutes-30", 1000L * 60 * 30);
        levels.put("__delay-hours-1", 1000L * 60 * 60);
        levels.put("__delay-hours-2", 1000L * 60 * 60 * 2);
    }

    public void start() {
        this.executorService = Executors.newFixedThreadPool(levels.size() + 1, new ThreadFactoryBuilder().setNameFormat("level-%d").build());

        for (Map.Entry<String, Long> entry : levels.entrySet()) {
            String topic = entry.getKey();
            Long delayTime = entry.getValue();
            DelayMessageRunner delayMessageRunner = new DelayMessageRunner(servers, groupId, topic, delayTime);
            this.executorService.execute(delayMessageRunner);
            this.runners.add(delayMessageRunner);
        }
        this.delayMessageListener = new DelayMessageListener(servers, groupId, new ArrayList<>(this.levels.keySet()));
        this.executorService.execute(this.delayMessageListener);
    }

    public void stop() {
        for (DelayMessageRunner runner : this.runners) {
            runner.shutdown();
        }
        this.runners.clear();

        if (this.delayMessageListener != null) {
            this.delayMessageListener.shutdown();
        }
        if (this.executorService != null) {
            this.executorService.shutdown();
        }
    }
}
