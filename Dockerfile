FROM openjdk:11.0.11-jre-buster

ENV SERVER_PORT 8080
ENV DEFAULT_USERNAME admin
ENV DEFAULT_PASSWORD admin

WORKDIR /usr/local/kafka-map

RUN wget https://github.com/dushixiang/kafka-map/releases/latest/download/kafka-map.tgz && \
tar -zxvf kafka-map.tgz -C /usr/local/ && rm -rf kafka-map.tgz

EXPOSE $SERVER_PORT

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/usr/local/kafka-map/kafka-map.jar", "--server.port=${SERVER_PORT}", "--default.username=${DEFAULT_USERNAME}", "--default.password=${DEFAULT_PASSWORD}"]