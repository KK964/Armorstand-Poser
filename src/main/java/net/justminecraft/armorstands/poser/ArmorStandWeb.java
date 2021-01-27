package net.justminecraft.armorstands.poser;

import org.bukkit.entity.Entity;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashMap;
import java.util.Random;

public class ArmorStandWeb implements Runnable {
    ServerSocket serverSocket;
    private HashMap<String, Entity> armorStands = new HashMap<>();

    public ArmorStandWeb() throws IOException {
        serverSocket = new ServerSocket(2048);
    }

    public void run() {
        try {
            while (true) {
                Socket s = serverSocket.accept();
                new Handler(s);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String createHandler(Entity e) {
        String s = "/" + Long.toString(new Random().nextLong(), 16);
        if(armorStands.size() > 100)
            armorStands.clear();
        armorStands.put(s, e);
        return "http://192.99.254.118:" + serverSocket.getLocalPort() + s;
    }

    class Handler extends Thread {
        Socket socket;

        public Handler(Socket socket) {
            this.socket = socket;
            start();
        }

        public void run() {
            try {

            } catch (Exception e) {
                e.printStackTrace();
            }
            try {
                socket.close();
            } catch (Exception e) {
            }
        }
    }
}
