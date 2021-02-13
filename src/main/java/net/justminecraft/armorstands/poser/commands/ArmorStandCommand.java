package net.justminecraft.armorstands.poser.commands;

import net.justminecraft.armorstands.poser.ArmorStandPoserPlugin;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.command.*;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ArmorStandCommand implements CommandExecutor, TabCompleter {

    private final ArmorStandPoserPlugin plugin;
    private HashMap<String, SubCommand> commands = new HashMap<>();
    private HelpCommand helpCommand = new HelpCommand();
    private boolean addCustomCommands;

    public ArmorStandCommand(ArmorStandPoserPlugin plugin) {
        this.plugin = plugin;

        PluginCommand armorStand = plugin.getCommand("armorstand");

        if (armorStand == null) {
            throw new RuntimeException("Could not find command /justplots (is it registered in the plugin.yml?)");
        }

        armorStand.setExecutor(this);
        armorStand.setTabCompleter(this);

        // Add the commands in the order they will appear in /p help
        addCommand(new SetArmorStandCommand());
        addCommand(new DataCommand());
        addCommand(new EditArmorStandCommand());
        addCommand(helpCommand);

        // Any future commands added will be marked as custom commands
        addCustomCommands = true;
    }

    /**
     * Add a sub command to /plot
     * @param command The command to add
     */
    public void addCommand(@NotNull SubCommand command) {
        command.setCustomCommand(addCustomCommands);

        for (String alias : command.getAliases()) {
            commands.put(alias, command);
        }
        commands.put(command.getName(), command);

        helpCommand.addCommand(command);
    }

    /**
     * Get a sub command of /plot
     * @param alias The name or an alias of this command
     * @return The command, or null if not found
     */
    @Nullable
    public SubCommand getCommand(@NotNull String alias) {
        return commands.get(alias);
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (args.length >= 1) {
            SubCommand subCommand = getCommand(args[0].toLowerCase());

            if (subCommand != null) {
                String[] newArgs = new String[args.length - 1];
                System.arraycopy(args, 1, newArgs, 0, newArgs.length);
                Bukkit.getScheduler().runTaskAsynchronously(plugin, () -> {
                    try {
                        subCommand.onCommand(sender, args[0], newArgs);
                    } catch (Exception e) {
                        sender.sendMessage(ChatColor.RED + "Unhandled expection: " + e.getClass().getSimpleName() + ": " + e.getMessage());
                        e.printStackTrace();
                    }
                });
                return true;
            }
        }

        return helpCommand.onCommand(sender, "", args);
    }

    @Override
    public List<String> onTabComplete(@NotNull CommandSender sender, @NotNull Command command, @NotNull String alias, @NotNull String[] args) {
        ArrayList<String> tabCompletion = new ArrayList<>();

        if (args.length >= 2) {
            SubCommand subCommand = commands.get(args[0].toLowerCase());

            if (subCommand != null) {
                String[] newArgs = new String[args.length - 1];
                System.arraycopy(args, 1, newArgs, 0, newArgs.length);
                subCommand.onTabComplete(sender, newArgs, tabCompletion);
            }

        } else if (args.length == 1) {
            commands.forEach((key, subCommand) -> {
                if ((subCommand.getPermission() == null || sender.hasPermission(subCommand.getPermission()))
                        && key.startsWith(args[0].toLowerCase())) {
                    tabCompletion.add(key);
                }
            });
        }

        return tabCompletion;
    }
}