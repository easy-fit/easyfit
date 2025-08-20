import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { storeSettingsSchema, defaultPickupHours, type StoreSettingsFormValues } from '@/constants/store-settings';
import type { Store } from '@/types/store';

interface UseStoreSettingsFormProps {
  store?: Store;
}

export function useStoreSettingsForm({ store }: UseStoreSettingsFormProps) {
  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      contactEmail: '',
      contactPhone: '',
      cuit: '',
      isOpen: false,
      tags: [],
      pickupHours: defaultPickupHours,
      address: undefined,
      customization: {
        logoUrl: '',
        bannerUrl: '',
        socialLinks: {},
      },
    },
  });

  // Reset form when store data changes
  useEffect(() => {
    if (store) {
      form.reset({
        contactEmail: store.contactEmail || '',
        contactPhone: store.contactPhone || '',
        cuit: store.cuit || '',
        isOpen: store.isOpen || false,
        tags: store.tags || [],
        pickupHours: store.pickupHours || defaultPickupHours,
        address: store.address,
        customization: {
          logoUrl: store.customization?.logoUrl || '',
          bannerUrl: store.customization?.bannerUrl || '',
          socialLinks: store.customization?.socialLinks || {},
        },
      });
    }
  }, [store, form]);

  return form;
}