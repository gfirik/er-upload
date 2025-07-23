import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface RoommateToggleProps {
  lookingForRoommate: boolean;
  setLookingForRoommate: (value: boolean) => void;
}

export default function RoommateToggle({
  lookingForRoommate,
  setLookingForRoommate,
}: RoommateToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-sm font-medium text-foreground">
          Xonadosh qidiryapsizmi?
        </Label>
      </div>
      <div className="flex items-center">
        <Switch
          checked={lookingForRoommate}
          onCheckedChange={setLookingForRoommate}
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted border-2 border-border/50 shadow-sm"
        />
      </div>
    </div>
  );
}
