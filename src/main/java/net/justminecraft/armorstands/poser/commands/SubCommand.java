package net.justminecraft.armorstands.poser.commands;

import org.bukkit.command.CommandSender;

import java.util.List;

public abstract class SubCommand {
    private final String usage;
    private final String name;
    private final String description;
    private final String[] aliases;

    private boolean customCommand = false;

    public SubCommand(String usage, String name, String description, String... aliases) {
        this.usage = usage;
        this.name = name;
        this.description = description;
        this.aliases = aliases;
    }

    public abstract boolean onCommand(CommandSender sender, String label, String[] args);

    public abstract void onTabComplete(CommandSender sender, String[] args, List<String> tabCompletion);

    public String getDescription() {
        return description;
    }

    public String getName() {
        return name;
    }

    public String[] getAliases() {
        return aliases;
    }

    public String getUsage() {
        return usage;
    }

    public String getPermission() {
        return null;
    }

    public final boolean isCustomCommand() {
        return customCommand;
    }

    final void setCustomCommand(boolean customCommand) {
        this.customCommand = customCommand;
    }
}
