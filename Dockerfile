FROM openjdk:11.0.11-jre-buster

WORKDIR /usr/local

RUN wget https://github.com/dushixiang/kafka-map/releases/latest/download/kafka-map.tgz && \
tar -zxvf kafka-map.tgz -C /usr/local && \
mv /usr/local/kafka-map/* .

CMD ["java", "-jar","/usr/local/kafka-map.jar"]