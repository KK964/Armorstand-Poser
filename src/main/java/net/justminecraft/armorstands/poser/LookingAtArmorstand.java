package net.justminecraft.armorstands.poser;

import org.bukkit.Location;
import org.bukkit.entity.Entity;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.LivingEntity;
import org.bukkit.entity.Player;
import org.bukkit.util.Vector;

import java.util.ArrayList;
import java.util.List;

public class LookingAtArmorstand {

    public boolean getLookingAt(Player player, LivingEntity livingEntity) {
        Location eye = player.getEyeLocation();

        Vector toEntity = livingEntity.getEyeLocation().toVector().subtract(eye.toVector());
        double dot = toEntity.normalize().dot(eye.getDirection());

        return dot > 0.99D;
    }

    public List<Entity> getArmorstands(Player player) {
        List<Entity> armorStands = new ArrayList<>();
        for(Entity e : player.getNearbyEntities(5,5,5)) {
            if(e instanceof LivingEntity) {
                if(getLookingAt(player, (LivingEntity) e)) {
                    if(e.getType() == EntityType.ARMOR_STAND) {
                        armorStands.add(e);
                    }
                }
            }
        }

        return armorStands;
    }
}
