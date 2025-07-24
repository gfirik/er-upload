import z from "zod";

export interface HouseFormData {
  city: string;
  district: string;
  address: string;
  rentPrice: string;
  deposit: string;
  floor: string;
  xonalar_soni: string;
  description: string;
  phoneNumber: string;
  lookingForRoommate: boolean;
  images: File[];
}

export interface House {
  id: string;
  shahar: string;
  tuman: string;
  manzil: string;
  oylik: number;
  garov_puli: number;
  xonalar_soni: number;
  qavat: number;
  tavsif?: string;
  contact: { phone: string };
  xonadosh_bolish: boolean;
  images: string[];
  created_at: string;
}

export const houseSchema = z.object({
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
