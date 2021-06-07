FROM openjdk:11.0.11-jre-buster

ENV SERVER_PORT 8080

WORKDIR /usr/local

RUN wget https://github.com/dushixiang/kafka-map/releases/latest/download/kafka-map.tgz && \
tar -zxvf kafka-map.tgz -C /usr/local && \
mv /usr/local/kafka-map/* .

EXPOSE $SERVER_PORT

CMD ["java", "-jar","/usr/local/kafka-map.jar"]