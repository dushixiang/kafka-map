# kafka map

给编程插上翅膀，给kafka装上导航。

[中文文档](README_zh.MD)

## Get Started

kafka-map is a concise kafka web manager that allows you to view and manage information such as Broker, Topic, Partition, Consumer Group, and retrieve messages from Topic.

Supported features:

- Multi-cluster management
- Topic Monitoring - View the number of partitions, number of copies, storage size, offset
- Topic Management - Create, Delete, Expand
- Broker Monitoring —— Partitions as Leader、	Partitions as Follower
- Consumer Management (View, Delete)
- Reset offset
- Consumer message - support String and JSON mode display

## Screenshots

[Screenshots](docs/screenshot.md)

## Disclaimer

Developers wishing to use `kafka-map` within a corporate network are advised to seek approval from their administrators or management before using the tool. By downloading, using, or distributing `kafka-map`, you agree to the [LICENSE](LICENSE) terms & conditions. No warranty or liability is provided.

## Dependencies

- Java8 or higher version
- Apache Kafka 1.1.0 or higher version


## Quick installation

Download
```shell
wget https://github.com/dushixiang/kafka-map/releases/latest/download/kafka-map.tgz
```

Decompression
```shell
tar -zxvf kafka-map.tgz -C /usr/local/
```

### Front run
```shell
# kafka-map folder
cd /usr/local/kafka-map
# run
java -jar kafka-map.jar 
```

### System service is running

Create a `kafka-map.service` at `/etc/systemd/system/` and write the following

```shell
[Unit]
Description=kafka map service
After=network.target

[Service]
WorkingDirectory=/usr/local/kafka-map
ExecStart=/usr/bin/java -jar /usr/local/kafka-map/kafka-map.jar
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Heavy Duty System Services && Settings Boot Launch && Startup Service && View Status

```shell
systemctl daemon-reload
systemctl enable kafka-map
systemctl start kafka-map
systemctl status kafka-map
```

### How to use

Next, use the browser to open the `8080` port you can access.

## FAQ

<details>
    <summary>What should I do if I don't want to use the 8080 port?</summary>

Add the port on the launch command to modify the port to `1234`

```shell
# example
java -jar kafka-map.jar --server.port=1234
```
</details>