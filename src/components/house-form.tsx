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

const houseSchema = z.object({
  telegram_id: z.number(),
  shahar: z.string(),
  tuman: z.string(),
  manzil: z.string(),
  oylik: z.string().transform(Number),
  garov_puli: z.string().transform(Number),
  maydon: z.string().transform(Number),
  qavat: z.string().transform(Number),
  tavsif: z.string().optional(),
  contact: z.object({ phone: z.string() }),
  xonadosh_bolish: z.boolean(),
  images: z.array(z.string()),
});

export default function HouseForm() {
  const { tg, setMainButtonParams, onMainButtonClick, closeApp } =
    useTelegram();

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

  // const uploadImages = async (telegramId: number): Promise<string[]> => {
  //   const uploadedUrls: string[] = [];

  //   for (const file of formData.images) {
  //     try {
  //       const filename = `${Date.now()}-${file.name}`;
  //       const path = `houses/${telegramId}/${filename}`;

  //       log("[Uploading]", path);

  //       const { error: uploadError } = await supabase.storage
  //         .from("houses")
  //         .upload(path, file);

  //       if (uploadError) {
  //         log("[Upload Error]", uploadError.message);
  //         throw new Error(uploadError.message);
  //       }

  //       const { data: urlData } = supabase.storage
  //         .from("houses")
  //         .getPublicUrl(path);

  //       log("[Uploaded URL]", urlData.publicUrl);
  //       uploadedUrls.push(urlData.publicUrl);
  //     } catch (error) {
  //       log("[Upload Exception]", error);
  //       throw error;
  //     }
  //   }

  //   return uploadedUrls;
  // };

  // const handleSubmit = useCallback(async () => {
  //   if (!isFormValid || !tg?.initDataUnsafe.user?.id) {
  //     tg?.showAlert?.("Ma'lumotlar to'liq emas!");
  //     return;
  //   }

  //   const telegramId = tg.initDataUnsafe.user.id;

  //   try {
  //     log("[Form Submission] Starting upload for Telegram ID:", telegramId);

  //     const imageUrls = await uploadImages(telegramId);

  //     const parsed = houseSchema.parse({
  //       telegram_id: telegramId,
  //       shahar: formData.city,
  //       tuman: formData.district,
  //       manzil: formData.address,
  //       oylik: formData.rentPrice,
  //       garov_puli: formData.deposit,
  //       maydon: formData.area,
  //       qavat: formData.floor,
  //       tavsif: formData.description,
  //       contact: { phone: formData.phoneNumber },
  //       xonadosh_bolish: formData.lookingForRoommate,
  //       images: imageUrls,
  //     });

  //     log("[Parsed Data]", parsed);

  //     const { error } = await supabase.from("houses").insert(parsed);

  //     if (error) {
  //       log("[Insert Error]", error.message);
  //       tg?.showAlert?.("Bazaga yozishda xatolik: " + error.message);
  //       return;
  //     }

  //     tg?.showAlert?.("Uy muvaffaqiyatli joylashtirildi!");
  //     setTimeout(closeApp, 1500);
  //   } catch (error: unknown) {
  //     log("[Submission Error]", error);
  //     const message =
  //       typeof error === "object" && error !== null && "message" in error
  //         ? (error as { message?: string }).message
  //         : "Noma'lum xatolik";
  //     tg?.showAlert?.("Xatolik: " + message);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [formData, isFormValid, tg, closeApp]);

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
        maydon: formData.area,
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
      setTimeout(closeApp, 1500);
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
    <div className="min-h-screen text-foreground py-4 px-2">
      <div className="max-w-md mx-auto">
        <Card className="text-accent-foreground">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold text-primary">
              Ijaraga uy!
            </CardTitle>
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
              <Label>Manzil</Label>
              <Input
                placeholder="Ko'cha yoki mavze bo'yicha"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ijara haqi (₩)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1000000"
                  value={formData.rentPrice}
                  onChange={(e) => updateFormData("rentPrice", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Garov puli (₩)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={formData.deposit}
                  onChange={(e) => updateFormData("deposit", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qavat</Label>
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  value={formData.floor}
                  onChange={(e) => updateFormData("floor", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maydon (m²)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 45"
                  value={formData.area}
                  onChange={(e) => updateFormData("area", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tavsif</Label>
              <Textarea
                placeholder="Uy haqida qo'shimcha ma'lumotlar..."
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Raqam</Label>
              <Input
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
