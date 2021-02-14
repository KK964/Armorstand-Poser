package net.justminecraft.armorstands.poser.commands;

import net.justminecraft.armorstands.poser.LookingAtArmorstand;
import net.justminecraft.plots.JustPlots;
import net.justminecraft.plots.Plot;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Player;

import java.util.Arrays;
import java.util.List;

public class MoveCommand extends SubCommand {

    private LookingAtArmorstand lookingAtArmorstand = new LookingAtArmorstand();
    private List<String> validDirections = Arrays.asList("N", "NE", "E", "SE", "S", "SW", "W", "NW", "U", "D");

    public MoveCommand() {
        super("/ase move <double> [direction]", "move", "Move armor stand in a direction", "move", "m");
    }

    @Override
    public boolean onCommand(CommandSender sender, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage("This is a player only command.");
            return false;
        }

        Player player = (Player) sender;

        Plot plot = JustPlots.getPlotAt(player.getLocation());
        if ((plot == null && !sender.hasPermission("ase.editanywhere")) || (!plot.isAdded(player.getUniqueId()) && !sender.hasPermission("ase.move.other"))) {
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

        if(args.length < 1) {
            player.sendMessage(ChatColor.RED + "You must input a number.");
            return false;
        }

        double moveAmount;

        try {
            moveAmount = Double.parseDouble(args[0]);
        } catch (NumberFormatException e) {
            player.sendMessage(ChatColor.RED + "That is not a valid number.");
            return false;
        }

        String moveDirection = getCardinalDirection(player);
        if(args.length > 1) {
            if(validDirections.contains(args[1].toUpperCase())) {
                moveDirection = args[1].toUpperCase();
            } else {
                player.sendMessage(ChatColor.RED + "That is not a valid direction, use: " + validDirections.toString());
            }
        }

        Location newLoc = getNewLocation(armorStand, moveDirection, moveAmount);
        Plot newLocPlot = JustPlots.getPlotAt(newLoc);
        if(!sender.hasPermission("ase.editanywhere") && (newLocPlot == null || newLocPlot != plot)) {
            player.sendMessage(ChatColor.RED + "That location is not on your plot.");
            return false;
        }

        armorStand.teleport(newLoc);
        player.sendMessage(ChatColor.GREEN + "Moved armor stand " + moveAmount + " in direction " + moveDirection + ".");
        return true;
    }

    private Location getNewLocation(Entity armorStand, String direction, double moveAmount) {
        Location newLoc = armorStand.getLocation();
        double negativeAmount = moveAmount * -1;
        for(char i : direction.toCharArray()) {
            String c = String.valueOf(i);
            switch (c) {
                case "N": {
                    newLoc.add(0,0, negativeAmount);
                    break;
                }
                case "E": {
                    newLoc.add(moveAmount, 0, 0);
                    break;
                }
                case "S": {
                    newLoc.add(0,0,moveAmount);
                    break;
                }
                case "W": {
                    newLoc.add(negativeAmount,0,0);
                    break;
                }
                case "U": {
                    newLoc.add(0,moveAmount,0);
                    break;
                }
                case "D": {
                    newLoc.add(0,negativeAmount,0);
                    break;
                }
            }
        }
        return newLoc;
    }

    @Override
    public void onTabComplete(CommandSender sender, String[] args, List<String> tabCompletion) {
        if(args.length == 2) {
            tabCompletion.addAll(validDirections);
        }
    }

    @Override
    public String getPermission() {
        return getPerm();
    }

    private static String getPerm() {
        return "ase.move";
    }

    private static String getCardinalDirection(Player player) {
        double pitch = (player.getLocation().getPitch() - 90.0) % 180.0;
        if(pitch < 0.0) {
            pitch += 180.0;
        }
        double rotation = (player.getLocation().getYaw() - 90) % 360;
        if (rotation < 0) {
            rotation += 360.0;
        }


        if(0 < pitch && pitch < 10.5) {
            return "U";
        } else if(160 < pitch && pitch <  180) {
            return "D";
        } else if (0 <= rotation && rotation < 22.5) {
            return "W";
        } else if (22.5 <= rotation && rotation < 67.5) {
            return "NW";
        } else if (67.5 <= rotation && rotation < 112.5) {
            return "N";
        } else if (112.5 <= rotation && rotation < 157.5) {
            return "NE";
        } else if (157.5 <= rotation && rotation < 202.5) {
            return "E";
        } else if (202.5 <= rotation && rotation < 247.5) {
            return "SE";
        } else if (247.5 <= rotation && rotation < 292.5) {
            return "S";
        } else if (292.5 <= rotation && rotation < 337.5) {
            return "SW";
        } else if (337.5 <= rotation && rotation < 360.0) {
            return "W";
        } else {
            return null;
        }
    }
}
