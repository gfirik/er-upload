import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { useTelegram } from "@/hooks/useTelegram";
import { supabase } from "@/lib/supabase";
import type { HouseFormData } from "@/types/house";
import ImageUploader from "@/components/image-uploader";
import RoommateToggle from "@/components/roommate-toggle";
import LocationSelector from "@/components/location-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { log } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const houseSchema = z.object({
  telegram_id: z.number(),
  shahar: z.string(),
  tuman: z.string(),
  manzil: z.string(),
  oylik: z.string().transform(Number),
  garov_puli: z.string().transform(Number),
  xonalar_soni: z.string().transform(Number),
  qavat: z.string().transform(Number),
  tavsif: z.string().optional(),
  contact: z.object({ phone: z.string() }),
  xonadosh_bolish: z.boolean(),
  images: z.array(z.string()),
});

export default function HouseForm() {
  const { tg, setMainButtonParams, onMainButtonClick, closeApp } =
    useTelegram();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<HouseFormData>({
    city: "",
    district: "",
    address: "",
    rentPrice: "",
    deposit: "",
    floor: "",
    xonalar_soni: "",
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

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || !tg?.initDataUnsafe.user?.id) {
      tg?.showAlert?.("Ma'lumotlar to'liq emas!");
      return;
    }

    const telegramId = tg.initDataUnsafe.user.id;

    try {
      log("[Form Submission] Starting upload for Telegram ID:", telegramId);

      // Step 1: Check if user exists, if not create user
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("telegram_id")
        .eq("telegram_id", telegramId)
        .single();

      if (userCheckError && userCheckError.code !== "PGRST116") {
        // PGRST116 means no rows found, which is fine
        log("[User Check Error]", userCheckError);
        throw new Error("User check failed: " + userCheckError.message);
      }

      // Step 2: If user doesn't exist, create them
      if (!existingUser) {
        log("[Creating User] User doesn't exist, creating...");
        const { error: userCreateError } = await supabase.from("users").insert({
          telegram_id: telegramId,
          user_name: tg.initDataUnsafe.user.username || "",
          full_name: `${tg.initDataUnsafe.user.first_name || ""} ${
            tg.initDataUnsafe.user.last_name || ""
          }`.trim(),
        });

        if (userCreateError) {
          log("[User Create Error]", userCreateError);
          throw new Error("User creation failed: " + userCreateError.message);
        }
        log("[User Created] Successfully created user");
      } else {
        log("[User Exists] User found, proceeding...");
      }

      // Step 3: Upload images
      const imageUrls = await uploadImages(telegramId);
      log("[Images Uploaded]", imageUrls);

      // Step 4: Prepare and validate data
      const parsed = houseSchema.parse({
        telegram_id: telegramId,
        shahar: formData.city,
        tuman: formData.district,
        manzil: formData.address,
        oylik: formData.rentPrice,
        garov_puli: formData.deposit,
        xonalar_soni: formData.xonalar_soni,
        qavat: formData.floor,
        tavsif: formData.description,
        contact: { phone: formData.phoneNumber },
        xonadosh_bolish: formData.lookingForRoommate,
        images: imageUrls,
      });

      log("[Parsed Data]", parsed);

      // Step 5: Insert house data
      const { error: houseError } = await supabase
        .from("houses")
        .insert(parsed);

      if (houseError) {
        log("[House Insert Error]", houseError);
        throw new Error("House insertion failed: " + houseError.message);
      }

      log("[Success] House inserted successfully");
      tg?.showAlert?.("Uy muvaffaqiyatli joylashtirildi!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error: unknown) {
      log("[Submission Error]", error);

      // More detailed error handling
      let errorMessage = "Noma'lum xatolik";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        if ("message" in error) {
          errorMessage = (error as { message: string }).message;
        } else if ("error" in error) {
          errorMessage = (error as { error: string }).error;
        }
      }

      tg?.showAlert?.("Xatolik: " + errorMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, isFormValid, tg, closeApp]);

  // Updated uploadImages function with better error handling
  const uploadImages = async (telegramId: number): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const [index, file] of formData.images.entries()) {
      try {
        const filename = `${Date.now()}-${index}-${file.name}`;
        const path = `houses/${telegramId}/${filename}`;

        log("[Uploading]", path);

        // Upload with explicit options
        const { error: uploadError, data } = await supabase.storage
          .from("houses")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          log("[Upload Error]", uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        log("[Upload Success]", data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("houses")
          .getPublicUrl(path);

        log("[Public URL]", urlData.publicUrl);
        uploadedUrls.push(urlData.publicUrl);
      } catch (error) {
        log("[Upload Exception]", error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const updateFormData = (field: keyof HouseFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    onMainButtonClick(handleSubmit);
    return () => tg?.MainButton.offClick(handleSubmit); // cleanup
  }, [handleSubmit, onMainButtonClick, tg]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-foreground py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header Section */}
        <div className="relative mb-8 flex flex-col items-center text-center">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="absolute left-2 top-1 flex items-center gap-1 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </Button>

          <div className="mt-2 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 15h8"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Uy ijarasi
          </h1>
          <p className="text-muted-foreground text-sm">
            Uyingizni ijaraga berish uchun ma'lumotlarni to'ldiring
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg font-semibold text-primary flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Uy ma'lumotlari
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Uy rasmlari
              </Label>
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <ImageUploader
                  images={formData.images}
                  setImages={(images) => updateFormData("images", images)}
                />
              </div>
            </div>

            {/* Roommate Toggle */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Xonadosh kerakmi?
              </Label>
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <RoommateToggle
                  lookingForRoommate={formData.lookingForRoommate}
                  setLookingForRoommate={(value) =>
                    updateFormData("lookingForRoommate", value)
                  }
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Manzil
              </Label>
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <LocationSelector
                  city={formData.city}
                  district={formData.district}
                  setCity={(city) => updateFormData("city", city)}
                  setDistrict={(district) =>
                    updateFormData("district", district)
                  }
                />
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Aniq manzil
                  </Label>
                  <Input
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    placeholder="Ko'cha yoki mavze bo'yicha batafsil"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Narx ma'lumotlari
              </Label>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Oylik ijara (₩)
                  </Label>
                  <Input
                    type="number"
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    placeholder="1,000,000"
                    value={formData.rentPrice}
                    onChange={(e) =>
                      updateFormData("rentPrice", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Garov puli (₩)
                  </Label>
                  <Input
                    type="number"
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    placeholder="5,000,000"
                    value={formData.deposit}
                    onChange={(e) => updateFormData("deposit", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* House Details Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Uy parametrlari
              </Label>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Qavat</Label>
                  <Input
                    type="number"
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    placeholder="3"
                    value={formData.floor}
                    onChange={(e) => updateFormData("floor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Xonalar soni
                  </Label>
                  <Input
                    type="number"
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    placeholder="3"
                    value={formData.xonalar_soni}
                    onChange={(e) =>
                      updateFormData("xonalar_soni", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Qo'shimcha ma'lumotlar
              </Label>
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <Textarea
                  className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200 min-h-[100px] resize-none"
                  placeholder="Uy haqida batafsil ma'lumot, qulayliklar, qo'shimcha shartlar..."
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Contact Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                Aloqa ma'lumotlari
              </Label>
              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Telefon raqami
                  </Label>
                  <Input
                    className="bg-input border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                    placeholder="+82 10-1234-5678"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      updateFormData("phoneNumber", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Form Status Indicator */}
            <div className="flex items-center justify-center pt-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isFormValid
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-orange-100 text-orange-700 border border-orange-200"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isFormValid ? "bg-green-500" : "bg-orange-500"
                  }`}
                ></div>
                {isFormValid
                  ? "Ma'lumotlar tayyor"
                  : "Asosiy maydonlarni to'ldiring"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          Barcha ma'lumotlar xavfsiz saqlanadi
        </div>
      </div>
    </div>
  );
}
