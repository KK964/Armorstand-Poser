package net.justminecraft.armorstands.poser;

import com.google.gson.JsonObject;
import com.mojang.brigadier.exceptions.CommandSyntaxException;
import net.minecraft.server.v1_16_R3.MojangsonParser;
import net.minecraft.server.v1_16_R3.NBTTagCompound;
import org.bukkit.craftbukkit.v1_16_R3.entity.CraftEntity;
import org.bukkit.entity.Entity;

public class NBTHandler {
    public String getNBT(Entity e) {
        net.minecraft.server.v1_16_R3.Entity nms = ((CraftEntity) e).getHandle();
        NBTTagCompound nbt = new NBTTagCompound();
        nms.a_(nbt);
        System.out.println(nbt);
        return nbt.toString();
    }

    public void setNBT(Entity e, String value) {
        net.minecraft.server.v1_16_R3.Entity nms = ((CraftEntity) e).getHandle();
        try {
            NBTTagCompound nbtv = MojangsonParser.parse(value);
            nms.load(nbtv);
        } catch (CommandSyntaxException ex) {
            ex.printStackTrace();
        }
    }

    public String getWebFormattedNBT(Entity e) {
        JsonObject jsonObject = new JsonObject();
        return jsonObject.toString();
    }
}
