#
# Build stage
#
FROM maven:3.8.3-jdk-11 AS build

WORKDIR /app

COPY ../src .
COPY ../pom.xml .
COPY ../LICENSE .
RUN mvn -f pom.xml clean package -Dmaven.test.skip=true


#
# Package stage
#
FROM openjdk:11-jre-slim

ENV SERVER_PORT 8080
ENV DEFAULT_USERNAME admin
ENV DEFAULT_PASSWORD admin

WORKDIR /usr/local/kafka-map

COPY --from=build /app/target/*.jar kafka-map.jar
COPY --from=build /app/target/LICENSE LICENSE

EXPOSE $SERVER_PORT

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/usr/local/kafka-map/kafka-map.jar", "--server.port=${SERVER_PORT}", "--default.username=${DEFAULT_USERNAME}", "--default.password=${DEFAULT_PASSWORD}"]