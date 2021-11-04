FROM openjdk:11.0.11-jre-buster

ENV SERVER_PORT 8080
ENV DEFAULT_USERNAME admin
ENV DEFAULT_PASSWORD admin

WORKDIR /usr/local/kafka-map

ADD kafka-map.jar .
ADD LICENSE .

EXPOSE $SERVER_PORT

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/usr/local/kafka-map/kafka-map.jar", "--server.port=${SERVER_PORT}", "--default.username=${DEFAULT_USERNAME}", "--default.password=${DEFAULT_PASSWORD}"]