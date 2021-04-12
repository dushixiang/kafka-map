package cn.typesafe.km.util;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Socket;

public class Networks {

    public static boolean isHostReachable(String host) {
        try {
            return InetAddress.getByName(host).isReachable(1000);
        } catch (IOException ignored) {

        }
        return false;
    }

    public static boolean isHostConnected(String host, int port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 3000);
            InetAddress localAddress = socket.getLocalAddress();
            String hostName = localAddress.getHostName();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
