import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { koreaLocations } from "@/data/locations";

interface LocationSelectorProps {
  city: string;
  district: string;
  setCity: (city: string) => void;
  setDistrict: (district: string) => void;
}

export default function LocationSelector({
  city,
  district,
  setCity,
  setDistrict,
}: LocationSelectorProps) {
  const cities = Object.keys(koreaLocations);
  const districts = city ? koreaLocations[city] : [];

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setDistrict(""); // Reset district when city changes
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Shahar</Label>
        <Select value={city} onValueChange={handleCityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Shahar tanlang" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {cities.map((cityName) => (
              <SelectItem key={cityName} value={cityName}>
                {cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tuman</Label>
        <Select value={district} onValueChange={setDistrict} disabled={!city}>
          <SelectTrigger>
            <SelectValue placeholder="Tuman tanlang" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {districts.map((districtName) => (
              <SelectItem key={districtName} value={districtName}>
                {districtName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
