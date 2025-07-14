import { z } from "zod";

export const houseSchema = z.object({
  telegram_id: z.number(),
  xonadosh_bolish: z.boolean(),
  shahar: z.string(),
  tuman: z.string(),
  manzil: z.string(),
  oylik: z.coerce.number(),
  garov_puli: z.coerce.number(),
  qavat: z.coerce.number(),
  maydon: z.coerce.number(),
  tavsif: z.string().optional(),
  contact: z.object({
    phone: z.string(),
  }),
  images: z.array(z.string().url()).max(6),
});
