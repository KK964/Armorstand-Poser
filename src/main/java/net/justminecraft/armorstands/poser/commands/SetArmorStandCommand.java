package net.justminecraft.armorstands.poser.commands;

import net.justminecraft.armorstands.poser.ArmorStandPoserPlugin;
import net.justminecraft.armorstands.poser.LookingAtArmorstand;
import net.justminecraft.plots.JustPlots;
import net.justminecraft.plots.Plot;
import net.md_5.bungee.api.chat.ClickEvent;
import net.md_5.bungee.api.chat.ComponentBuilder;
import org.bukkit.ChatColor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.*;

import java.util.List;

public class SetArmorStandCommand extends SubCommand {
    private LookingAtArmorstand lookingAtArmorstand = new LookingAtArmorstand();

    public SetArmorStandCommand() {
        super("/ase setarmorstand", "setarmorstand", "Get link to edit armorstand with the web editor", "set", "s");
    }

    @Override
    public boolean onCommand(CommandSender sender, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This is a player only command.");
            return false;
        }

        Player player = (Player) sender;

        Plot plot = JustPlots.getPlotAt(player.getLocation());
        if ((plot == null && !sender.hasPermission("ase.editanywhere")) || (!plot.isAdded(player.getUniqueId()) && !sender.hasPermission("ase.set.other"))) {
            player.sendMessage(ChatColor.RED + "You do not have permission to build here.");
            return false;
        }

        Entity armorStand = lookingAtArmorstand.getEntities(player);

        if(armorStand == null) {
            player.sendMessage(ChatColor.RED + "You are not looking at an armor stand.");
            lookingAtArmorstand.highlightArmorStands(player);
            return false;
        }

        Plot armorStandPlot = JustPlots.getPlotAt(armorStand);

        if(!sender.hasPermission("ase.editanywhere") && (armorStandPlot == null || armorStandPlot != plot)) {
            player.sendMessage(ChatColor.RED + "You cannot edit this Armor Stand.");
            return false;
        }

        lookingAtArmorstand.highlightArmorStand((ArmorStand) armorStand);

        player.sendMessage(ChatColor.GREEN + "Click here to set armor stand:");
        String s;

        if(player.hasPermission("ase.set.autosave")) {
            s = ArmorStandPoserPlugin.getArmorStandWeb().createHandler(armorStand, true);
        } else {
            s = ArmorStandPoserPlugin.getArmorStandWeb().createHandler(armorStand);
        }

        player.spigot().sendMessage(new ComponentBuilder(s).color(net.md_5.bungee.api.ChatColor.WHITE)
                .event(new ClickEvent(ClickEvent.Action.OPEN_URL, s)).create());

        return true;
    }

    @Override
    public void onTabComplete(CommandSender sender, String[] args, List<String> tabCompletion) {
    }

    @Override
    public String getPermission() {
        return getPerm();
    }

    private static String getPerm() {
        return "ase.set";
    }
}
