package net.justminecraft.armorstands.poser;

import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.entity.*;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.util.Vector;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

public class LookingAtArmorstand {

    private List<LivingEntity> rayTraceEntities(Player player) {
        Location loc = player.getEyeLocation();
        List<LivingEntity> entities = new ArrayList<>();
        rayTrace:
        for(int i = 0; i < 20; i++) {
            loc = loc.add(loc.getDirection().getX() / 1.5, loc.getDirection().getY() / 1.5, loc.getDirection().getZ() / 1.5);
            for(Entity ent : loc.getWorld().getNearbyEntities(loc, 0.2, 0.2, 0.2)) {
                if(ent instanceof LivingEntity) {
                    if(isArmorStand((LivingEntity) ent)) {
                        entities.add((LivingEntity) ent);
                        break rayTrace;
                    }
                }
            }
        }
        return entities;
    }

    private boolean isArmorStand(LivingEntity livingEntity) {
        if(livingEntity.getType() == EntityType.ARMOR_STAND) return true;
        return false;
    }

    public Entity getEntities(Player player){
        List<LivingEntity> ent = new ArrayList<>(rayTraceEntities(player));
        if(ent.isEmpty()) return null;
        return ent.get((int) Math.random() * ent.size());
    }

    public int highlightArmorStands(Player player) {
        int total = 0;
        for(Entity ent : player.getNearbyEntities( 10, 10, 10)) {
            if(ent.getType() == EntityType.ARMOR_STAND) {
                total++;
                setGlowing((ArmorStand) ent, 200);
            }
        }
        return total;
    }

    public void highlightArmorStand(ArmorStand armorStand) {
        setGlowing(armorStand, 100);
    }

    private void setGlowing(ArmorStand armorStand, int duration) {
        LivingEntity livingEntity = armorStand;
        livingEntity.addPotionEffect(new PotionEffect(PotionEffectType.GLOWING, duration, 1, true));
    }
}
