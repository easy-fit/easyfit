import { z } from 'zod';
import { STORE_TAGS_VALUES } from './store-tags';

// Form schema for store settings
export const storeSettingsSchema = z.object({
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().optional(),
  cuit: z.string().optional(),
  isOpen: z.boolean(),
  tags: z.array(z.enum(STORE_TAGS_VALUES as [string, ...string[]])).max(5, 'Máximo 5 etiquetas permitidas'),
  pickupHours: z.array(
    z.object({
      day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const),
      open: z.string(),
      close: z.string(),
    }),
  ),
  address: z
    .object({
      formatted: z.object({
        street: z.string(),
        streetNumber: z.string(),
        apartment: z.string().optional(),
        floor: z.string().optional(),
        building: z.string().optional(),
        city: z.string(),
        province: z.string(),
        postalCode: z.string(),
      }),
      location: z.object({
        type: z.literal('Point'),
        coordinates: z.tuple([z.number(), z.number()]),
      }),
    })
    .optional(),
  customization: z
    .object({
      logoUrl: z.string().optional(),
      bannerUrl: z.string().optional(),
      socialLinks: z
        .object({
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          twitter: z.string().optional(),
          tiktok: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

// Day labels for pickup hours
export const dayLabels = {
  mon: 'Lunes',
  tue: 'Martes',
  wed: 'Miércoles',
  thu: 'Jueves',
  fri: 'Viernes',
  sat: 'Sábado',
  sun: 'Domingo',
} as const;

// Default pickup hours
export const defaultPickupHours = [
  { day: 'mon' as const, open: '09:00', close: '18:00' },
  { day: 'tue' as const, open: '09:00', close: '18:00' },
  { day: 'wed' as const, open: '09:00', close: '18:00' },
  { day: 'thu' as const, open: '09:00', close: '18:00' },
  { day: 'fri' as const, open: '09:00', close: '18:00' },
  { day: 'sat' as const, open: '10:00', close: '18:00' },
  { day: 'sun' as const, open: '10:00', close: '17:00' },
];