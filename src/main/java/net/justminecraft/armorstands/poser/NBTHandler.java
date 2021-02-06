package net.justminecraft.armorstands.poser;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import net.minecraft.server.v1_16_R3.MojangsonParser;
import net.minecraft.server.v1_16_R3.NBTTagCompound;
import org.bukkit.craftbukkit.v1_16_R3.entity.CraftEntity;
import org.bukkit.craftbukkit.v1_16_R3.inventory.CraftItemStack;
import org.bukkit.entity.Entity;
import org.bukkit.inventory.ItemStack;

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

    public JsonObject getNBTWebInput(Entity e) {
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
                switch (s) {
                    case "HandItems": {
                        //"HandItems":"[{id:\"minecraft:pink_stained_glass\",Count:1b,tag:{display:{Name:'{\"text\":\"Support Pinky\"}'}}},{}]"
                        String handItems = nbt.get(s).asString();
                        handItems = handItems.substring(1);
                        handItems = handItems.substring(0, handItems.length() -1);
                        String[] items = handItems.split("(?<=(\\})),");
                        for(String i : items) {
                            i = i.substring(1);
                            i = i.substring(0, i.length() -1);
                            String[] iA = i.split("");
                        }
                    }
                    case "Pose": {
                        //"Pose":"{RightArm:[0.0f,0.0f,0.0f],LeftLeg:[0.0f,0.0f,0.0f],LeftArm:[0.0f,0.0f,0.0f],RightLeg:[0.0f,0.0f,0.0f]}"
                        String pose = nbt.get(s).asString();
                        pose = pose.substring(1);
                        pose = pose.substring(0, pose.length() -1);
                        String[] poseArray = pose.split("(?<=(\\])),");
                        JsonObject poseObject = new JsonObject();
                        for(String p : poseArray) {
                            String[] pO = p.split(":");
                            pO[1] = pO[1].replaceAll("(\\[|\\])", "");
                            String[] pOI = pO[1].split(",");
                            JsonArray pOIArray = new JsonArray();
                            for(String pI : pOI) {
                                pOIArray.add(pI);
                            }
                            poseObject.add(pO[0], pOIArray);
                        }
                        formattedNBT.add(s, poseObject);
                        break;
                    }
                    case "Rotation": {
                        //"Rotation":"[73.0f,0.0f]"
                        String customRotation = nbt.get(s).asString();
                        customRotation = customRotation.replaceAll("(\\[|\\])", "");
                        String[] rotationAgs = customRotation.split(",");
                        JsonArray rotationArray = new JsonArray();
                        for(String rot : rotationAgs) {
                            rotationArray.add(rot);
                        }
                        formattedNBT.add(s, rotationArray);
                        break;
                    }
                    case "CustomName": {
                        //"CustomName":"{\"text\":\"\"}"
                        String customName = nbt.get(s).asString();
                        customName = customName.substring(1);
                        customName = customName.substring(0, customName.length() - 1);
                        customName = customName.replaceAll("\"", "");
                        String[] nameArgs = customName.split(",");
                        JsonObject nameObj = new JsonObject();
                        for(String n : nameArgs) {
                            System.out.println(n);
                            String[] nm = n.split(":");
                            nameObj.addProperty(nm[0], nm[1]);
                        }
                        formattedNBT.add(s, nameObj);
                        break;
                    }
                    default:
                        formattedNBT.addProperty(s, nbt.get(s).asString());
                        break;
                }
            }
        }

        return formattedNBT;
    }

    public String itemStackToNBT(ItemStack itemStack) {
        net.minecraft.server.v1_16_R3.ItemStack nmsStack = CraftItemStack.asNMSCopy(itemStack);
        Set<String> keys = new HashSet<>(nmsStack.getTag().getKeys());

        return null;
    }

    public static String replaceLast(String string, String toReplace, String replacement) {
        int pos = string.lastIndexOf(toReplace);
        if (pos > -1) {
            return string.substring(0, pos)
                    + replacement
                    + string.substring(pos + toReplace.length());
        } else {
            return string;
        }
    }
}
