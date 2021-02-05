package net.justminecraft.armorstands.poser;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import net.minecraft.server.v1_16_R3.MojangsonParser;
import net.minecraft.server.v1_16_R3.NBTTagCompound;
import org.bukkit.craftbukkit.v1_16_R3.entity.CraftEntity;
import org.bukkit.entity.Entity;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

public class NBTHandler {
    public String getNBT(Entity e) {
        net.minecraft.server.v1_16_R3.Entity nms = ((CraftEntity) e).getHandle();
        NBTTagCompound nbt = new NBTTagCompound();
        nms.a_(nbt);
        return nbt.toString();
    }

    public void setNBT(Entity e, String value) {
        if(value == null) return;
        net.minecraft.server.v1_16_R3.Entity nms = ((CraftEntity) e).getHandle();
        NBTTagCompound nbtv;
        try {
            nbtv = MojangsonParser.parse(value);
        } catch (CommandSyntaxException ex) {
            ex.printStackTrace();
            return;
        }
        nms.load(nbtv);
    }

    public String getWebFormattedNBT(Entity e, String newNbt) {
        String oldNbt = getNBT(e);
        NBTTagCompound nbtOld;
        NBTTagCompound nbtNew;

        try {
             nbtOld = MojangsonParser.parse(oldNbt);
             nbtNew = MojangsonParser.parse(newNbt);
        } catch (CommandSyntaxException ex) {
            ex.printStackTrace();
            return null;
        }

        Set<String> newNbtSet = new HashSet<>(nbtNew.getKeys());
        for(String nbtKey : newNbtSet) {
            nbtOld.set(nbtKey, nbtNew.get(nbtKey));
        }
        return nbtOld.toString();
    }

    public String getNBTWebInput(Entity e) {
        ArrayList<String> validNBT = new ArrayList<>(Arrays.asList("Invisible",
                "Invulnerable",
                "PersistenceRequired",
                "NoBasePlate",
                "NoGravity",
                "ShowArms",
                "Small",
                "Marker",
                "Rotation",
                "ArmorItems",
                "HandItems",
                "CustomName",
                "CustomNameVisible",
                "DisabledSlots",
                "Pose"));

        net.minecraft.server.v1_16_R3.Entity nms = ((CraftEntity) e).getHandle();
        NBTTagCompound nbt = new NBTTagCompound();
        nms.a_(nbt);

        Set<String> keys = new HashSet<>(nbt.getKeys());
        JsonObject formattedNBT = new JsonObject();
        for(String s : keys) {
            if(validNBT.contains(s)) {
                String regBrackets = "(\\[|\\])";
                switch (s) {
                    case "Rotation": {
                        //"Rotation":"[73.0f,0.0f]"
                        String customRotation = nbt.get(s).toString();
                        customRotation = customRotation.replace(regBrackets, "");
                        String[] rotationAgs = customRotation.split(",");
                        JsonArray rotationArray = new JsonArray();
                        for(String rot : rotationAgs) {
                            rotationArray.add(rot);
                        }
                        formattedNBT.add("Rotation", rotationArray);
                        break;
                    }
                    case "CustomName": {
                        //"CustomName":"{\"text\":\"\"}"
                        String customName = nbt.get(s).asString();
                        customName = customName.substring(1);
                        customName = customName.substring(0, customName.length() - 1);
                        String[] nameArgs = customName.split(",");
                        JsonArray nameArray = new JsonArray();
                        for(String n : nameArgs) {
                            String[] nArgs = n.split(":");
                            JsonObject nO = new JsonObject();
                            nO.addProperty(nArgs[0], nArgs[1]);
                            nameArray.add(nO);
                        }
                        formattedNBT.add("name", nameArray);
                        break;
                    }
                    default:
                        formattedNBT.addProperty(s, nbt.get(s).asString());
                        break;
                }
            }
        }

        return formattedNBT.toString();
    }
}
