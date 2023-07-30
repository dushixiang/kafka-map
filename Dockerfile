#
# Build stage
#
FROM node:16 AS front-build

WORKDIR /app

COPY web .

RUN yarn config set network-timeout 300000 && yarn && yarn build

FROM maven:3-amazoncorretto-17 AS build

WORKDIR /app

COPY src src
COPY pom.xml pom.xml
COPY LICENSE LICENSE
COPY --from=front-build /app/dist src/main/resources/static

RUN mvn -f pom.xml clean package -Dmaven.test.skip=true


# base image to build a JRE
FROM amazoncorretto:17.0.8-alpine as corretto-jdk

# required for strip-debug to work
RUN apk add --no-cache binutils

# Build small JRE image
RUN $JAVA_HOME/bin/jlink \
         --verbose \
         --add-modules ALL-MODULE-PATH \
         --strip-debug \
         --no-man-pages \
         --no-header-files \
         --compress=2 \
         --output /customjre

#
# Package stage
#
FROM alpine:latest

ENV JAVA_HOME=/jre
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# copy JRE from the base image
COPY --from=corretto-jdk /customjre $JAVA_HOME

ENV SERVER_PORT 8080
ENV DEFAULT_USERNAME admin
ENV DEFAULT_PASSWORD admin

WORKDIR /usr/local/kafka-map

COPY --from=build /app/target/*.jar kafka-map.jar
COPY --from=build /app/LICENSE LICENSE

EXPOSE $SERVER_PORT

ENTRYPOINT ["/jre/bin/java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/usr/local/kafka-map/kafka-map.jar", "--server.port=${SERVER_PORT}", "--default.username=${DEFAULT_USERNAME}", "--default.password=${DEFAULT_PASSWORD}"]