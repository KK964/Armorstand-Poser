package net.justminecraft.armorstands.poser;

import com.google.gson.JsonObject;
import org.bukkit.entity.Entity;
import org.bukkit.scheduler.BukkitScheduler;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Random;

public class ArmorStandWeb implements Runnable {
    NBTHandler nbtHandler = new NBTHandler();
    ServerSocket serverSocket;
    private HashMap<String, Entity> armorStands = new HashMap<>();
    private final ArmorStandPoserPlugin plugin;

    public ArmorStandWeb(ArmorStandPoserPlugin plugin) throws IOException {
        serverSocket = new ServerSocket(2058);
        this.plugin = plugin;
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
        return "http://arthangout.art:" + serverSocket.getLocalPort() + s;
    }

    class Handler extends Thread {
        Socket socket;

        public Handler(Socket socket) {
            this.socket = socket;
            start();
        }

        public void run() {
            try {
                BufferedOutputStream out = new BufferedOutputStream(socket.getOutputStream());
                BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                String header;
                while ((header = reader.readLine()) != null) {
                    String[] head = header.split(" ");
                    String s = null;
                    while ((s = reader.readLine()).length() > 1) ;
                    URL url = new URL("http://example.com" + head[1]);
                    String path = url.getPath();
                    String query = url.getQuery();
                    String armorStandNbt2 = null;
                    String inputJson = null;
                    String requestData = null;
                    if(query != null) {
                        path = path.replace(query, "");
                        for (String q : query.split("&")) {
                            if (q.startsWith("armorStandNbt="))
                                armorStandNbt2 = URLDecoder.decode(q.substring("armorStandNbt=".length()), "UTF-8");
                            if (q.startsWith("armorstandSaveData="))
                                inputJson = URLDecoder.decode(q.substring("armorstandSaveData=".length()), "UTF-8");
                            if (q.startsWith("requestData="))
                                requestData = URLDecoder.decode(q.substring("requestData=".length()), "UTF-8");
                        }
                    }
                    String armorStandNbt = armorStandNbt2;
                    if(armorStands.containsKey(path)) {
                        Entity ar = armorStands.get(path);
                        String content = "An error occurred";
                        if(requestData != null) {
                            JsonObject jsonContent = new JsonObject();
                            jsonContent = nbtHandler.getNBTWebInput(ar);
                            out.write("HTTP/1.1 200 OK\r\n".getBytes());
                            out.write("Content-Type: application/json; charset=UTF-8\r\n".getBytes());
                            out.write(("Content-Length: " + jsonContent.toString().length() + "\r\n").getBytes());
                            out.write("Server: ArmorStandPoser\r\n".getBytes());
                            out.write("Connection: keep-alive\r\n".getBytes());
                            out.write("\r\n".getBytes());
                            out.write(jsonContent.toString().getBytes(StandardCharsets.UTF_8));
                            out.flush();
                        } else {
                            if(armorStandNbt == null) {
                                if(inputJson == null) {

                                }
                                InputStream in = ArmorStandPoserPlugin.armorStandPoserPlugin.getResource("web/index.htm");
                                byte[] c = new byte[16000];
                                int l = in.read(c);
                                content = new String(c, 0, l, StandardCharsets.UTF_8);
                                content = content.replaceAll("\\{WORLD\\}", ar.getWorld().getName())
                                        .replaceAll("\\{X\\}", String.valueOf(ar.getLocation().getX()))
                                        .replaceAll("\\{Y\\}", String.valueOf(ar.getLocation().getY()))
                                        .replaceAll("\\{Z\\}", String.valueOf(ar.getLocation().getZ()));
                            } else {
                                if(ar.isValid()) {
                                    content = "Updated Armor Stand";
                                    String toSendNbt = nbtHandler.getWebFormattedNBT(ar, armorStandNbt);
                                    if(toSendNbt == null) {
                                        content = "There was an error";
                                    } else {
                                        plugin.getServer().getScheduler().runTask(plugin, () -> {
                                            nbtHandler.setNBT(ar, toSendNbt);
                                        });
                                    }
                                } else {
                                    content = "The Armor Stand May of been deleted.";
                                }
                            }
                            out.write("HTTP/1.1 200 OK\r\n".getBytes());
                            out.write("Content-Type: text/html; charset=UTF-8\r\n".getBytes());
                            out.write(("Content-Length: " + content.length() + "\r\n").getBytes());
                            out.write("Server: ArmorStandPoser\r\n".getBytes());
                            out.write("Connection: keep-alive\r\n".getBytes());
                            out.write("\r\n".getBytes());
                            out.write(content.getBytes(StandardCharsets.UTF_8));
                            out.flush();
                        }
                    } else {
                        String content = "404 Not Found";
                        if(path.equals("/style.css") || path.equals("/js/colorpick.js") || path.equals("/js/colorpick.css") || path.equals("/js/main.js")) {
                            String contentType = "text/html";
                            switch (path) {
                                case "/style.css": {
                                    InputStream in = ArmorStandPoserPlugin.armorStandPoserPlugin.getResource("web/style.css");
                                    byte[] c = new byte[4500];
                                    int l = in.read(c);
                                    contentType = "text/css";
                                    content = new String(c, 0, l, StandardCharsets.UTF_8);
                                    break;
                                }
                                case "/js/colorpick.js": {
                                    InputStream in = ArmorStandPoserPlugin.armorStandPoserPlugin.getResource("web/js/colorpick.js");
                                    byte[] c = new byte[25000];
                                    int l = in.read(c);
                                    contentType = "text/javascript";
                                    content = new String(c, 0, l, StandardCharsets.UTF_8);
                                    break;
                                }
                                case "/js/colorpick.css": {
                                    InputStream in = ArmorStandPoserPlugin.armorStandPoserPlugin.getResource("web/js/colorpick.css");
                                    byte[] c = new byte[10000];
                                    int l = in.read(c);
                                    contentType = "text/css";
                                    content = new String(c, 0, l, StandardCharsets.UTF_8);
                                    break;
                                }
                                case "/js/main.js": {
                                    InputStream in = ArmorStandPoserPlugin.armorStandPoserPlugin.getResource("web/js/main.js");
                                    byte[] c = new byte[55000];
                                    int l = in.read(c);
                                    contentType = "text/javascript";
                                    content = new String(c, 0, l, StandardCharsets.UTF_8);
                                    break;
                                }
                            }
                            String outWriteType = "Content-Type: " + contentType + "; charset=UTF-8\r\n";
                            out.write("HTTP/1.1 200 OK\r\n".getBytes());
                            out.write(outWriteType.getBytes());
                            out.write(("Content-Length: " + content.length() + "\r\n").getBytes());
                            out.write("Server: ArmorStandPoser\r\n".getBytes());
                            out.write("Connection: keep-alive\r\n".getBytes());
                            out.write("\r\n".getBytes());
                            out.write(content.getBytes(StandardCharsets.UTF_8));
                            out.flush();
                        }
                        else {
                            out.write("HTTP/1.1 404 NOT FOUND\r\n".getBytes());
                            out.write("Content-Type: text/html; charset=UTF-8\r\n".getBytes());
                            out.write(("Content-Length: " + content.length() + "\r\n").getBytes());
                            out.write("Server: ArmorStandPoser\r\n".getBytes());
                            out.write("Connection: keep-alive\r\n".getBytes());
                            out.write("\r\n".getBytes());
                            out.write(content.getBytes(StandardCharsets.UTF_8));
                            out.flush();
                        }
                    }
                }
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
