import { useState } from "react";
import ImageUploader from "@/components/image-uploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { koreaLocations } from "@/data/locations";

export default function HouseForm() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const cities = Object.keys(koreaLocations);
  const districts = city ? koreaLocations[city] : [];

  return (
    <div className="min-h-screen bg-muted py-4 px-2">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold text-blue-600">
              Ijaraga uy!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader images={images} setImages={setImages} />
            <div className="space-y-2">
              <Label>Shahar</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tuman</Label>
              <Select
                value={district}
                onValueChange={setDistrict}
                disabled={!city}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tumanni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Manzil</Label>
              <Input placeholder="Ko'cha yoki mavze bo'yicha" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ijara haqi (₩)</Label>
                <Input type="number" placeholder="e.g. 1000000" />
              </div>
              <div className="space-y-2">
                <Label>Garov puli (₩)</Label>
                <Input type="number" placeholder="e.g. 5000000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qavat</Label>
                <Input type="number" placeholder="e.g. 3" />
              </div>
              <div className="space-y-2">
                <Label>Maydon (m²)</Label>
                <Input type="number" placeholder="e.g. 45" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tavsif</Label>
              <Textarea placeholder="Uy haqida qo'shimcha ma'lumotlar..." />
            </div>

            <div className="space-y-2">
              <Label>Raqam</Label>
              <Input placeholder="e.g. +82 10-1234-5678" />
            </div>

            <Button className="w-full mt-4">Joylash</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
