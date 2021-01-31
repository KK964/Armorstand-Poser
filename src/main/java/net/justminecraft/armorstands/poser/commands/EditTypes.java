package net.justminecraft.armorstands.poser.commands;

import java.util.ArrayList;

public class  EditTypes {
    public String getType(String var) {
        switch (var) {
            case "visible":
            case "small":
            case "baseplate":
            case "gravity":
            case "showarms":
            case "invulnerable": return "boolean";
            case "pose": return "EulerAngle";
        }
        return null;
    }
}
