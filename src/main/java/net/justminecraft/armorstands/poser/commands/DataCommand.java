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

import java.util.List;

public class DataCommand extends SubCommand {

    LookingAtArmorstand lookingAtArmorstand = new LookingAtArmorstand();
    NBTHandler nbtHandler = new NBTHandler();

    public DataCommand() {
        super("/ase data <option>", "data", "Get data of an armorstand");
    }

    @Override
    public boolean onCommand(CommandSender sender, String label, String[] args) {
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
                        System.out.println(nbtHandler.getNBTWebInput(armorStand));
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

    @Override
    public void onTabComplete(CommandSender sender, String[] args, List<String> tabCompletion) {
        if(args.length == 1) {
            tabCompletion.add("show");
            tabCompletion.add("nbt");
        }
    }
}
