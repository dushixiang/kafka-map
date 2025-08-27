### Tencent EdgeOne

"本项目 CDN 加速及安全防护由 Tencent EdgeOne 赞助：EdgeOne 提供长期有效的免费套餐，包含不限量的流量和请求，覆盖中国大陆节点，且无任何超额收费，感兴趣的朋友可以点击下面的链接领取"

[亚洲最佳CDN、边缘和安全解决方案 - Tencent EdgeOne](https://edgeone.ai/zh?from=github)


### SharonNetworks

亚太数据中心提供顶级的中国优化网络接入 · 低延时&高带宽&提供Tbps级本地清洗高防服务, 为您的业务保驾护航, 为您的客户提供极致体验.

加入社区 Telegram群组 https://t.me/SharonNetwork 可参与公益募捐或群内抽奖免费使用。

---

# kafka map

English | [简体中文](./README-zh_CN.md)

Add wings to programming and install navigation to `kafka`。

## Introduction

`kafka-map` is a `kafka` visualization tool developed using `Java17` and `React`.

Supported features:

- Multi-cluster management.
- Cluster status monitoring (number of partitions, number of replicas, storage size, offset).
- Topic create, delete, expansion (delete needs to configure delete.topic.enable = true).
- Broker status monitoring.
- Consumer group view and delete.
- Reset offset.
- Topic data view and search (Support String and json display).
- Send message to Topic
- Delay message (supports 18 levels of delayed messages).

## Screenshot

### Import cluster

![添加集群](./screenshot/import-cluster.png)

### Clusters

![集群管理](./screenshot/clusters.png)

### Brokers

![broker](./screenshot/brokers.png)

### Topics

![主题管理](./screenshot/topics.png)

### Consumer Groups

![消费组](./screenshot/consumers.png)

### Consumer Group Subscription

![消费组详情](./screenshot/consumer-subscription.png)

### Topic Partition

![topic详情——分区](./screenshot/topic-info-partition.png)

### Topic Brokers

![topic详情——broker](./screenshot/topic-info-broker.png)

### Topic Consumer Groups

![topic详情——消费组](./screenshot/topic-info-consumer.png)

### Topic Consumer Groups Reset Offset

![topic详情——消费组重置offset](./screenshot/topic-info-consumer-reset-offset.png)

### Topic Configs

![topic详情——配置信息](./screenshot/topic-info-config.png)

### Produce Message

![消费消息](./screenshot/producer-message.png)

### Consume Message

![消费消息](./screenshot/consumer-message.png)

### Delay Message

![延迟消息](./screenshot/delay-message.png)

## Disclaimer

Developers wishing to use `kafka-map` within a corporate network are advised to seek approval from their administrators or management before using the tool. By downloading, using, or distributing `kafka-map`, you agree to the [LICENSE](./LICENSE) terms & conditions. No warranty or liability is provided.

## Required

- Java17 or higher
- Apache Kafka 1.1.0 or higher

## install by docker

end

| Param  | Description  |
|---|---|
| DEFAULT_USERNAME |  Initial login username |
| DEFAULT_PASSWORD |  Initial login password |

```shell
docker run -d \
    -p 8080:8080 \
    -v /opt/kafka-map/data:/usr/local/kafka-map/data \
    -e DEFAULT_USERNAME=admin \
    -e DEFAULT_PASSWORD=admin \
    --name kafka-map \
    --restart always dushixiang/kafka-map:latest
```

## install by native

download
```shell
wget https://github.com/dushixiang/kafka-map/releases/latest/download/kafka-map.tgz
```

unzip
```shell
tar -zxvf kafka-map.tgz -C /usr/local/
```

### Running in the foreground
```shell
# kafka-map dir
cd /usr/local/kafka-map
# Modify the configuration according to your needs
vi application.yml
# run
java -jar kafka-map.jar 
```

### Running in System service

```shell
cat <<EOF >> /etc/systemd/system/kafka-map.service
[Unit]
Description=kafka map service
After=network.target

[Service]
WorkingDirectory=/usr/local/kafka-map
ExecStart=/usr/bin/java -jar /usr/local/kafka-map/kafka-map.jar
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
```

Reload system service && set boot auto-start && start service && view status

```shell
systemctl daemon-reload
systemctl enable kafka-map
systemctl start kafka-map
systemctl status kafka-map
```

### Usage

Then use the browser to open the server's port `8080` to access.

## FAQ

<details>
    <summary>What if I don't want to use port 8080?</summary>

Add `--server.port=1234` to the startup command to modify the port to `1234`.

```shell
# example
java -jar kafka-map.jar --server.port=1234
```
</details>
