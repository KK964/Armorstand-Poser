package net.justminecraft.armorstands.poser.commands;

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
