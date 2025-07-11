import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/image-uploader";
import RoommateToggle from "@/components/roommate-toggle";
import LocationSelector from "@/components/location-selector";
import { useTelegram } from "@/hooks/useTelegram";
import type { HouseFormData } from "@/types/house";

export default function HouseForm() {
  const { setMainButtonParams, onMainButtonClick, closeApp } = useTelegram();

  const [formData, setFormData] = useState<HouseFormData>({
    city: "",
    district: "",
    address: "",
    rentPrice: "",
    deposit: "",
    floor: "",
    area: "",
    description: "",
    phoneNumber: "",
    lookingForRoommate: false,
    images: [],
  });

  const isFormValid =
    !!formData.city && !!formData.district && !!formData.address;

  useEffect(() => {
    setMainButtonParams({ is_active: isFormValid });
  }, [isFormValid, setMainButtonParams]);

  useEffect(() => {
    onMainButtonClick(handleSubmit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (!isFormValid) return;
    console.log("Form submitted", formData);
    alert("Uy muvaffaqiyatli joylashtirildi!");
    setTimeout(closeApp, 1500);
  };

  const updateFormData = (field: keyof HouseFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="min-h-screen text-foreground py-4 px-2">
      <div className="max-w-md mx-auto">
        <Card className="text-accent-foreground">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-center text-lg font-bold text-primary flex-1">
                Ijaraga uy!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUploader
              images={formData.images}
              setImages={(images) => updateFormData("images", images)}
            />

            <RoommateToggle
              lookingForRoommate={formData.lookingForRoommate}
              setLookingForRoommate={(value) =>
                updateFormData("lookingForRoommate", value)
              }
            />

            <LocationSelector
              city={formData.city}
              district={formData.district}
              setCity={(city) => updateFormData("city", city)}
              setDistrict={(district) => updateFormData("district", district)}
            />

            <div className="space-y-2">
              <Label className="text-muted-foreground">Manzil</Label>
              <Input
                className="bg-input border border-border text-foreground"
                placeholder="Ko'cha yoki mavze bo'yicha"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Ijara haqi (₩)</Label>
                <Input
                  type="number"
                  className="bg-input border border-border text-foreground"
                  placeholder="e.g. 1000000"
                  value={formData.rentPrice}
                  onChange={(e) => updateFormData("rentPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Garov puli (₩)</Label>
                <Input
                  type="number"
                  className="bg-input border border-border text-foreground"
                  placeholder="e.g. 5000000"
                  value={formData.deposit}
                  onChange={(e) => updateFormData("deposit", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Qavat</Label>
                <Input
                  type="number"
                  className="bg-input border border-border text-foreground"
                  placeholder="e.g. 3"
                  value={formData.floor}
                  onChange={(e) => updateFormData("floor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Maydon (m²)</Label>
                <Input
                  type="number"
                  className="bg-input border border-border text-foreground"
                  placeholder="e.g. 45"
                  value={formData.area}
                  onChange={(e) => updateFormData("area", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Tavsif</Label>
              <Textarea
                className="bg-input border border-border text-foreground"
                placeholder="Uy haqida qo'shimcha ma'lumotlar..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Raqam</Label>
              <Input
                className="bg-input border border-border text-foreground"
                placeholder="e.g. +82 10-1234-5678"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData("phoneNumber", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
