package net.justminecraft.armorstands.poser;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import org.bukkit.entity.ArmorStand;
import org.bukkit.entity.Entity;

public class NBTHandler {
    public JsonObject getNBT(ArmorStand armorStand) {
        JsonObject armorStandNBT = new JsonObject();

        ArmorStandData as = new ArmorStandData(armorStand);
        if(as.showArms) armorStandNBT.addProperty("ShowArms", true);
        if(!as.gravity) armorStandNBT.addProperty("NoGravity", true);
        if(!as.basePlate) armorStandNBT.addProperty("NoBasePlate", true);
        if(as.small) armorStandNBT.addProperty("Small", true);
        if(!as.visible) armorStandNBT.addProperty("Invisible", true);
        if(as.invulnerable) armorStandNBT.addProperty("Invulnerable", true);

        return armorStandNBT;
    }
}
