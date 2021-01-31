package net.justminecraft.armorstands.poser.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.util.StringUtil;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class TabComplete implements TabCompleter {

    EditTypes editTypes = new EditTypes();

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        final List<String> completions = new ArrayList<>();
        if(command.getName().equalsIgnoreCase("editarmorstand")) {
            if(args.length == 1) {
                completions.add("visible");
                completions.add("small");
                completions.add("basePlate");
                completions.add("gravity");
                completions.add("showArms");
                completions.add("invulnerable");
            }
            if(args.length == 2) {
                if(editTypes.getType(args[0].toLowerCase()) == "boolean") {
                    completions.add("true");
                    completions.add("false");
                }
            }
        }
        Collections.sort(completions);
        return completions;
    }
}