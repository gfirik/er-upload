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
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="space-y-1">
        <Label className="text-sm font-medium">Xonadosh qidiryapsizmi?</Label>
      </div>
      <Switch
        checked={lookingForRoommate}
        onCheckedChange={setLookingForRoommate}
      />
    </div>
  );
}
