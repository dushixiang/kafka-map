package cn.typesafe.km.util;

import org.springframework.util.DigestUtils;

import java.util.Arrays;

/**
 * @author dushixiang
 * @date 2021/3/27 14:05
 */
public final class Sign {

    public static String sign(String... input) {
        Arrays.sort(input);
        return DigestUtils.md5DigestAsHex(String.join("-", input).getBytes());
    }
}
