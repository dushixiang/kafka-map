package cn.typesafe.km.controller.handle;

import org.apache.kafka.common.errors.InvalidRequestException;
import org.apache.kafka.common.errors.TimeoutException;
import org.apache.kafka.common.errors.TopicExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ResponseBody
    @ExceptionHandler(value = TopicExistsException.class)
    public Map<String, Object> topicExistsException(TopicExistsException e) {
        String message = e.getMessage();
        Map<String, Object> data = new HashMap<>();
        data.put("message", message);
        return data;
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ResponseBody
    @ExceptionHandler(value = InvalidRequestException.class)
    public Map<String, Object> invalidRequestException(InvalidRequestException e) {
        String message = e.getMessage();
        Map<String, Object> data = new HashMap<>();
        data.put("message", message);
        return data;
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST)
    @ResponseBody
    @ExceptionHandler(value = IllegalArgumentException.class)
    public Map<String, Object> illegalArgumentException(IllegalArgumentException e) {
        String message = e.getMessage();
        Map<String, Object> data = new HashMap<>();
        data.put("message", message);
        return data;
    }

    @ResponseStatus(value = HttpStatus.GATEWAY_TIMEOUT)
    @ResponseBody
    @ExceptionHandler(value = TimeoutException.class)
    public Map<String, Object> timeoutException(TimeoutException e) {
        String message = e.getMessage();
        Map<String, Object> data = new HashMap<>();
        data.put("message", "timeout, " + message);
        return data;
    }
}
