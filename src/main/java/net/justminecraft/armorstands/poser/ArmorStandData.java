package net.justminecraft.armorstands.poser;

import org.bukkit.entity.ArmorStand;
import org.bukkit.inventory.ItemStack;
import org.bukkit.util.EulerAngle;

public class ArmorStandData {
    public final Boolean visible, small, basePlate, gravity, showArms, invulnerable;
    public final EulerAngle headPos, leftArmPos, rightArmPos, bodyPos, leftLegPos, rightLegPos;
    public final ItemStack head, body, legs, feet, rightHand, leftHand;

    public ArmorStandData(ArmorStand armorStand) {
        this.visible = armorStand.isVisible();
        this.small = armorStand.isSmall();
        this.basePlate = armorStand.hasBasePlate();
        this.gravity = armorStand.hasGravity();
        this.showArms = armorStand.hasArms();
        this.invulnerable = armorStand.isInvulnerable();

        this.headPos = armorStand.getHeadPose();
        this.leftArmPos = armorStand.getLeftArmPose();
        this.rightArmPos = armorStand.getRightArmPose();
        this.bodyPos = armorStand.getBodyPose();
        this.leftLegPos = armorStand.getLeftLegPose();
        this.rightLegPos = armorStand.getRightLegPose();

        this.head = armorStand.getEquipment().getHelmet();
        this.body = armorStand.getEquipment().getChestplate();
        this.legs = armorStand.getEquipment().getLeggings();
        this.feet = armorStand.getEquipment().getBoots();
        this.rightHand = armorStand.getEquipment().getItemInMainHand();
        this.leftHand = armorStand.getEquipment().getItemInOffHand();
    }
}
