'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, MapPin, Search, Plus } from 'lucide-react';

import { useCreateStore } from '@/hooks/api/use-stores';
import { usePlacesAutocomplete, useGeocode, type PlacePrediction } from '@/hooks/api/use-places';
import { useEasyFitToast } from '@/hooks/use-toast';
import type { CreateStoreDTO, PickupHours } from '@/types/store';
import type { Address } from '@/types/global';
import { convertGeocodeToAddress } from '@/lib/utils/address';

const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().optional(),
  storeType: z.enum(['physical', 'online'], {
    message: 'Seleccioná un tipo',
  }),
  tags: z.string().optional(), // comma-separated
  // address handled separately via Places
});

type FormValues = z.infer<typeof schema>;

function getDefaultPickupHours(): PickupHours {
  return [
    { day: 'mon', open: '09:00', close: '18:00' },
    { day: 'tue', open: '09:00', close: '18:00' },
    { day: 'wed', open: '09:00', close: '18:00' },
    { day: 'thu', open: '09:00', close: '18:00' },
    { day: 'fri', open: '09:00', close: '20:00' },
    { day: 'sat', open: '10:00', close: '14:00' },
    { day: 'sun', open: '00:00', close: '00:00' },
  ];
}

export interface CreateStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (storeId: string) => void;
}

export function CreateStoreDialog({ open, onOpenChange, onCreated }: CreateStoreDialogProps) {
  const toast = useEasyFitToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      contactEmail: '',
      contactPhone: '',
      storeType: 'physical',
      tags: '',
    },
  });

  // Address search state
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<Address | null>(null);

  const { data: acData, isLoading: acLoading } = usePlacesAutocomplete(query, showSuggestions && query.length >= 3);
  const { data: geoData, isLoading: geoLoading } = useGeocode(selectedPlaceId || undefined);

  // Remember last resolved place to avoid repeated updates
  const lastResolvedPlaceId = useRef<string | null>(null);

  // When geocode resolves, map to Address via helper
  useEffect(() => {
    if (!geoData?.result || !selectedPlaceId) return;
    // Prevent re-setting the same place selection repeatedly
    if (lastResolvedPlaceId.current === selectedPlaceId) return;
    try {
      const addr = convertGeocodeToAddress(geoData.result);
      setResolvedAddress(addr);
      lastResolvedPlaceId.current = selectedPlaceId;
    } catch {
      // Only show the toast once for this selection
      if (lastResolvedPlaceId.current !== selectedPlaceId) {
        toast.error('No se pudo procesar la dirección seleccionada');
      }
    }
  }, [geoData, selectedPlaceId]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      form.reset();
      setQuery('');
      setShowSuggestions(false);
      setSelectedPlaceId(null);
      setResolvedAddress(null);
    }
  }, [open, form]);

  const createStore = useCreateStore();

  const onSubmit = async (values: FormValues) => {
    if (!resolvedAddress) {
      toast.warning('Seleccioná una dirección válida');
      return;
    }

    const tagsArray =
      values.tags
        ?.split(',')
        .map((t) => t.trim())
        .filter(Boolean) ?? [];

    const payload: CreateStoreDTO = {
      name: values.name,
      address: resolvedAddress,
      pickupHours: getDefaultPickupHours(),
      options: {
        freeShipping: {
          enabled: false,
        },
      },
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone || undefined,
      storeType: values.storeType,
      customization: undefined,
      tags: tagsArray,
    };

    try {
      const result = await createStore.mutateAsync(payload);
      const id = result.data._id;
      toast.success('Tienda creada', {
        description: 'Configurala desde el panel de la tienda',
      });
      onOpenChange(false);
      onCreated?.(id);
    } catch (e: unknown) {
      const message = (e as Error)?.message || 'No se pudo crear la tienda';
      toast.error(message);
    }
  };

  const suggestions = useMemo(() => acData?.predictions ?? [], [acData]);

  const handleSelectPlace = (p: PlacePrediction) => {
    setSelectedPlaceId(p.place_id);
    setQuery(p.description);
    setShowSuggestions(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#20313A]">Crear tienda</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tienda Deportiva Runner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address search */}
            <div className="space-y-2">
              <Label>Dirección</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="h-4 w-4" />
                </div>
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(e.target.value.length >= 3);
                    setSelectedPlaceId(null);
                    setResolvedAddress(null);
                  }}
                  onFocus={() => setShowSuggestions(query.length >= 3)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Calle y número, ciudad"
                  className="pl-9"
                />
                {(acLoading || geoLoading) && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-md mt-1 max-h-56 overflow-auto">
                    {suggestions.map((p) => (
                      <button
                        key={p.place_id}
                        type="button"
                        onClick={() => handleSelectPlace(p)}
                        className="w-full text-left px-3 py-2 hover:bg-[#DBF7DC] flex items-start gap-2"
                      >
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-medium text-[#20313A] truncate">{p.main_text}</div>
                          {p.secondary_text && <div className="text-xs text-gray-600 truncate">{p.secondary_text}</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {resolvedAddress && (
                <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {resolvedAddress.formatted.street} {resolvedAddress.formatted.streetNumber},{' '}
                  {resolvedAddress.formatted.city}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contacto</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@tienda.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+54 9 ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="storeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de tienda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Física</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="ropa, deportiva, casual" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createStore.isPending || !resolvedAddress}
                className="bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
              >
                {createStore.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear tienda
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
