package cn.typesafe.km.util;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;

public class Networks {

    public static boolean isHostReachable(String host, int timeout) {
        try {
            return InetAddress.getByName(host).isReachable(timeout);
        } catch (IOException ignored) {

        }
        return false;
    }

    public static boolean isHostConnected(String host, int port, int timeout) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeout);
//            InetAddress localAddress = socket.getLocalAddress();
//            String hostName = localAddress.getHostName();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
