package net.justminecraft.armorstands.poser;

import net.justminecraft.armorstands.poser.commands.ArmorStand;
import net.justminecraft.armorstands.poser.commands.SetArmorStandCommand;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.File;

public class ArmorStandPoserPlugin extends JavaPlugin {

    public static ArmorStandPoserPlugin armorStandPoserPlugin = null;

    @Override
    public void onEnable() {
        armorStandPoserPlugin = this;
        getLogger().info("Just Armor Stands Poser Enabled!");
    }

    @Override
    public void onDisable() {
        getLogger().info("Just Armor Stands Poser Disabled!");
    }

    private void registerCommands() {
        getCommand("armorstand").setExecutor(new ArmorStand(this));
    }
}
