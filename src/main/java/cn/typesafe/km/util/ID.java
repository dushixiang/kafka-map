package cn.typesafe.km.util;

import java.util.UUID;

/**
 * @author dushixiang
 * @date 2021/3/27 11:52 上午
 */
public final class ID {
    public static String uuid() {
        return UUID.randomUUID().toString();
    }
}
