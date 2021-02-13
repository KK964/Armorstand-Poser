package net.justminecraft.armorstands.poser.commands;

import net.justminecraft.armorstands.poser.LookingAtArmorstand;
import net.justminecraft.armorstands.poser.NBTHandler;
import net.justminecraft.plots.JustPlots;
import net.justminecraft.plots.Plot;
import org.bukkit.ChatColor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.*;
import org.bukkit.entity.Entity;

import java.util.List;

public class DataCommand extends SubCommand {

    LookingAtArmorstand lookingAtArmorstand = new LookingAtArmorstand();
    NBTHandler nbtHandler = new NBTHandler();

    public DataCommand() {
        super("/ase data <option>", "data", "Get data of an armorstand", "data");
    }

    @Override
    public boolean onCommand(CommandSender sender, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This is a player only command.");
            return false;
        }

        Player player = (Player) sender;

        Plot plot = JustPlots.getPlotAt(player.getLocation());
        if ((plot == null && !sender.hasPermission("ase.editanywhere")) || (!plot.isAdded(player.getUniqueId()) && !sender.hasPermission("ase.data.show.other"))) {
            player.sendMessage(ChatColor.RED + "You do not have permission to build here.");
            return false;
        }

        Entity armorStand = lookingAtArmorstand.getEntities(player);

        Plot armorStandPlot = JustPlots.getPlotAt(armorStand);

        if(armorStand != null && (!sender.hasPermission("ase.editanywhere") && (armorStandPlot == null || armorStandPlot != plot))) {
            player.sendMessage(ChatColor.RED + "You cannot edit this Armor Stand.");
            return false;
        }

        if(args.length > 0) {
            switch (args[0]) {
                case "show": {
                    int total = lookingAtArmorstand.highlightArmorStands(player);
                    player.sendMessage(ChatColor.GREEN + "Giving " + total + " Armor Stands around you glowing for 10s.");
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

    @Override
    public String getPermission() {
        return getPerm();
    }

    private static String getPerm() {
        return "ase.data.show";
    }
}
