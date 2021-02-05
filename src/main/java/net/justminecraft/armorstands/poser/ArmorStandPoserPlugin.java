package net.justminecraft.armorstands.poser;

import net.justminecraft.armorstands.poser.commands.ArmorStandCommand;
import net.justminecraft.armorstands.poser.commands.EditArmorStandCommand;
import net.justminecraft.armorstands.poser.commands.SetArmorStandCommand;
import net.justminecraft.armorstands.poser.commands.TabComplete;
import org.bukkit.Bukkit;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

public class ArmorStandPoserPlugin extends JavaPlugin {

    public static ArmorStandPoserPlugin armorStandPoserPlugin;

    public static File DATA_FOLDER;
    public static InputStream WEB_FOLDER;

    public ArmorStandWeb armorStandWeb;

    @Override
    public void onEnable() {
        armorStandPoserPlugin = this;
        DATA_FOLDER = getDataFolder();
        WEB_FOLDER = getResource("web");

        try {
            armorStandWeb = new ArmorStandWeb(this);
            Bukkit.getScheduler().runTaskAsynchronously(this, armorStandWeb);
        } catch (IOException e1) {
            e1.printStackTrace();
        }

        registerCommands();
        registerTabComplete();
        getLogger().info("Just Armor Stands Poser Enabled!");
    }

    @Override
    public void onDisable() {
        getLogger().info("Just Armor Stands Poser Disabled!");
        try {
            armorStandWeb.serverSocket.close();
        } catch (Exception ignored) {}
    }

    private void registerCommands() {
        getCommand("armorstand").setExecutor(new ArmorStandCommand(this));
        getCommand("setarmorstand").setExecutor(new SetArmorStandCommand(this));
        getCommand("editarmorstand").setExecutor(new EditArmorStandCommand(this));
    }

    private void registerTabComplete() {
        getCommand("editarmorstand").setTabCompleter(new TabComplete());
    }
}
