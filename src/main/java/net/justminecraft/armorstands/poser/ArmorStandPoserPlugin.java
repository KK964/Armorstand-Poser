package net.justminecraft.armorstands.poser;

import net.justminecraft.armorstands.poser.commands.*;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public class ArmorStandPoserPlugin extends JavaPlugin {

    private static ArmorStandPoserPlugin armorStandPoserPlugin;
    private static ArmorStandWeb armorStandWeb;
    private static ArmorStandCommand armorStandCommand;

    public static File DATA_FOLDER;
    public static InputStream WEB_FOLDER;

    public static ArmorStandPoserPlugin getPlugin() {
        return armorStandPoserPlugin;
    }

    @Override
    public void onEnable() {
        armorStandPoserPlugin = this;
        DATA_FOLDER = getDataFolder();
        WEB_FOLDER = getResource("web");
        armorStandCommand = new ArmorStandCommand(this);

        try {
            armorStandWeb = new ArmorStandWeb(this);
            Bukkit.getScheduler().runTaskAsynchronously(this, armorStandWeb);
        } catch (IOException e1) {
            e1.printStackTrace();
        }

        getLogger().info("Just Armor Stands Poser Enabled!");
    }

    @Override
    public void onDisable() {
        getLogger().info("Just Armor Stands Poser Disabled!");
        try {
            armorStandWeb.serverSocket.close();
        } catch (Exception ignored) {}
    }

    public static ArmorStandWeb getArmorStandWeb() {
        return getPlugin().armorStandWeb;
    }

    public static ArmorStandCommand getCommandExecuter() {
        return getPlugin().armorStandCommand;
    }
}
