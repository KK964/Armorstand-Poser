package net.justminecraft.armorstands.poser.commands;

import net.justminecraft.armorstands.poser.ArmorStandPoserPlugin;
import net.justminecraft.armorstands.poser.LookingAtArmorstand;
import net.justminecraft.armorstands.poser.NBTHandler;
import net.justminecraft.plots.JustPlots;
import net.justminecraft.plots.Plot;
import net.minecraft.server.v1_16_R3.NBTTagCompound;
import org.bukkit.ChatColor;
import org.bukkit.Effect;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.*;
import org.bukkit.entity.Entity;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;

public class ArmorStandCommand implements CommandExecutor {

    private final ArmorStandPoserPlugin plugin;
    private LookingAtArmorstand lookingAtArmorstand = new LookingAtArmorstand();
    private NBTHandler nbtHandler = new NBTHandler();

    public ArmorStandCommand(ArmorStandPoserPlugin plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        Player player = (Player) sender;

        Plot plot = JustPlots.getPlotAt(player.getLocation());
        if (plot == null || (!plot.isAdded(player.getUniqueId()) && !sender.isOp())) {
            player.sendMessage(ChatColor.RED + "You do not have permission to build here.");
            return false;
        }

        Entity armorStand = lookingAtArmorstand.getEntities(player);



        if(args.length > 0) {
            switch (args[0]) {
                case "show": {
                    int total = lookingAtArmorstand.highlightArmorStands(player);
                    player.sendMessage(ChatColor.GREEN + "Giving " + total + "Armor Stands around you glowing for 10s.");
                    break;
                }
                case "nbt": {
                    if(armorStand == null) {
                        player.sendMessage(ChatColor.RED + "You are not looking at an armor stand.");
                        return false;
                    } else {
                        player.sendMessage("nbt:");
                        player.sendMessage(nbtHandler.getNBT(armorStand));
                        break;
                    }
                }
            }
        } else {
            if(armorStand == null) {
                player.sendMessage(ChatColor.RED + "You are not looking at an armor stand.");
                return false;
            }
            player.sendMessage(nbtHandler.getNBT((ArmorStand) armorStand).toString());
        }

        return true;
    }
}
