package net.justminecraft.armorstands.poser.commands;

import net.justminecraft.armorstands.poser.ArmorStandPoserPlugin;
import net.justminecraft.armorstands.poser.LookingAtArmorstand;
import net.justminecraft.plots.JustPlots;
import net.justminecraft.plots.Plot;
import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;

import java.util.ArrayList;
import java.util.List;

public class ArmorStand implements CommandExecutor {

    private final ArmorStandPoserPlugin plugin;
    private LookingAtArmorstand lookingAtArmorstand;

    public ArmorStand(ArmorStandPoserPlugin plugin) {
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

        List<Entity> armorStands = new ArrayList<>(lookingAtArmorstand.getArmorstands(player));
        if(armorStands.size() == 0) {
            player.sendMessage(ChatColor.RED + "You are not looking at an armor stand.");
            return false;
        }

        return true;
    }
}
