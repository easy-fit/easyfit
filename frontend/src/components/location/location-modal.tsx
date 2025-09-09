/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MapPin, Search, Clock, Loader2, Building, Home } from 'lucide-react';
import { usePlacesAutocomplete, useGeocode, type PlacePrediction } from '@/hooks/api/use-places';
import { useUpdateMyAddress } from '@/hooks/api/use-users';
import { convertGeocodeToAddress, createBasicAddress } from '@/lib/utils/address';
import { useEasyFitToast } from '@/hooks/use-toast';
import type { Address } from '@/types/global';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  currentLocation?: string;
  userAddress?: {
    formatted: {
      street: string;
      streetNumber: string;
      apartment?: string;
      floor?: string;
      building?: string;
      city: string;
      province: string;
      postalCode: string;
    };
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
}

// Generate recent addresses based on user data
const generateRecentAddresses = (userAddress?: LocationModalProps['userAddress']) => {
  if (userAddress) {
    return [
      {
        id: 'user-address',
        name: 'Mi dirección',
        address: `${userAddress.formatted.street} ${userAddress.formatted.streetNumber}${
          userAddress.formatted.apartment ? `, Depto ${userAddress.formatted.apartment}` : ''
        }, ${userAddress.formatted.city}`,
        type: 'home',
      },
    ];
  }
  return [];
};

export function LocationModal({ isOpen, onClose, onLocationSelect, currentLocation, userAddress }: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pendingAddress, setPendingAddress] = useState<Address | null>(null);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState({
    floor: '',
    apartment: '',
    building: '',
  });
  const recentAddresses = generateRecentAddresses(userAddress);
  const toast = useEasyFitToast();

  // API calls
  const { data: autocompleteData, isLoading: isLoadingAutocomplete } = usePlacesAutocomplete(
    searchQuery,
    showSuggestions && searchQuery.length >= 3,
  );

  const { data: geocodeData, isLoading: isLoadingGeocode } = useGeocode(selectedPlaceId || undefined);

  const updateAddressMutation = useUpdateMyAddress();

  // Effect para manejar el geocoding completado
  useEffect(() => {
    if (geocodeData?.result && selectedPlaceId) {
      const address = convertGeocodeToAddress(geocodeData.result);
      setPendingAddress(address);
      setShowAdditionalFields(true);
    }
  }, [geocodeData, selectedPlaceId]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setShowSuggestions(false);
      setSelectedPlaceId(null);
      setPendingAddress(null);
      setShowAdditionalFields(false);
      setAdditionalInfo({ floor: '', apartment: '', building: '' });
    }
  }, [isOpen]);

  const handleFinalConfirmation = async () => {
    if (!pendingAddress) return;

    try {
      // Agregar información adicional a la dirección
      const finalAddress: Address = {
        ...pendingAddress,
        formatted: {
          ...pendingAddress.formatted,
          floor: additionalInfo.floor || undefined,
          apartment: additionalInfo.apartment || undefined,
          building: additionalInfo.building || undefined,
        },
      };

      // Guardar en la base de datos
      await updateAddressMutation.mutateAsync(finalAddress);

      // Crear string para mostrar en UI
      const displayAddress = `${finalAddress.formatted.street} ${finalAddress.formatted.streetNumber}${
        finalAddress.formatted.apartment ? `, Depto ${finalAddress.formatted.apartment}` : ''
      }${finalAddress.formatted.floor ? `, Piso ${finalAddress.formatted.floor}` : ''}, ${finalAddress.formatted.city}`;

      // Actualizar UI
      onLocationSelect(displayAddress);
      onClose();

      toast.addressSaved();
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.smartError(error, 'Error al actualizar la dirección');
    }
  };

  const handleDirectAddressSelect = async (address: string) => {
    // Si es una dirección reciente (ya guardada), no necesitamos geocoding
    const isRecentAddress = recentAddresses.some((recent) => recent.address === address);

    if (isRecentAddress) {
      onLocationSelect(address);
      onClose();
      return;
    }

    // Para direcciones nuevas sin geocoding, crear dirección básica y mostrar campos adicionales
    try {
      const basicAddress = createBasicAddress(address);
      setPendingAddress(basicAddress);
      setShowAdditionalFields(true);
    } catch (error) {
      console.error('Error creating basic address:', error);
      toast.error('Error al procesar la dirección');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Si hay sugerencias, usar la primera
      if (autocompleteData?.predictions && autocompleteData.predictions.length > 0) {
        const firstSuggestion = autocompleteData.predictions[0];
        handlePlaceSelect(firstSuggestion);
      } else {
        // Si no hay sugerencias, usar el texto directamente
        handleDirectAddressSelect(searchQuery.trim());
      }
    }
  };

  const handlePlaceSelect = (place: PlacePrediction) => {
    setSelectedPlaceId(place.place_id);
    setSearchQuery(place.description);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length >= 3);
    setSelectedPlaceId(null);
    setPendingAddress(null);
    setShowAdditionalFields(false);
  };

  const handleInputFocus = () => {
    if (searchQuery.length >= 3) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleAdditionalInfoChange = (field: keyof typeof additionalInfo, value: string) => {
    setAdditionalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkipAdditionalInfo = async () => {
    if (!pendingAddress) return;

    try {
      // Guardar dirección sin información adicional
      await updateAddressMutation.mutateAsync(pendingAddress);

      // Crear string para mostrar en UI
      const displayAddress = `${pendingAddress.formatted.street} ${pendingAddress.formatted.streetNumber}, ${pendingAddress.formatted.city}`;

      // Actualizar UI
      onLocationSelect(displayAddress);
      onClose();

      toast.addressSaved();
    } catch (error: any) {
      console.error('Error updating address:', error);
      toast.smartError(error, 'Error al actualizar la dirección');
    }
  };

  const isProcessing = isLoadingGeocode || updateAddressMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-[#20313A] font-helvetica">
            {showAdditionalFields ? 'Completá tu dirección' : 'Ingresá tu dirección'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {!showAdditionalFields || !pendingAddress ? (
            <>
              {/* Search Input */}
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Dirección o punto de referencia"
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    disabled={isProcessing}
                    className="pl-10 pr-10 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493] h-12"
                  />
                  {(isLoadingAutocomplete || isLoadingGeocode) && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
                  )}
                </form>

                {/* Autocomplete Suggestions */}
                {showSuggestions && autocompleteData?.predictions && autocompleteData.predictions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {autocompleteData.predictions.map((prediction) => (
                      <Button
                        key={prediction.place_id}
                        variant="ghost"
                        onClick={() => handlePlaceSelect(prediction)}
                        disabled={isProcessing}
                        className="w-full justify-start h-auto p-3 hover:bg-[#DBF7DC] text-left border-0 rounded-none"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[#20313A] truncate">{prediction.main_text}</p>
                            {prediction.secondary_text && (
                              <p className="text-sm text-gray-600 truncate">{prediction.secondary_text}</p>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showSuggestions &&
                  searchQuery.length >= 3 &&
                  !isLoadingAutocomplete &&
                  (!autocompleteData?.predictions || autocompleteData.predictions.length === 0) && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-4 text-center">
                      <p className="text-sm text-gray-600">No se encontraron direcciones</p>
                    </div>
                  )}
              </div>

              {/* Recent Addresses */}
              {recentAddresses.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-[#20313A] mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Direcciones recientes
                    </h3>
                    <div className="space-y-2">
                      {recentAddresses.map((address) => (
                        <Button
                          key={address.id}
                          variant="ghost"
                          onClick={() => handleDirectAddressSelect(address.address)}
                          disabled={isProcessing}
                          className="w-full justify-start h-auto p-3 hover:bg-[#DBF7DC] text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                              <MapPin className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#20313A] truncate">{address.name}</p>
                              <p className="text-sm text-gray-600 truncate">{address.address}</p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state for geocoding */}
              {isLoadingGeocode && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-[#9EE493]" />
                  <span className="ml-2 text-sm text-gray-600">Obteniendo detalles de la dirección...</span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected Address Display */}
              <div className="bg-[#DBF7DC]/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-[#9EE493] p-2 rounded-full">
                    <Home className="h-4 w-4 text-[#20313A]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#20313A]">Dirección seleccionada</p>
                    <p className="text-sm text-gray-600">
                      {pendingAddress?.formatted?.street || ''} {pendingAddress?.formatted?.streetNumber || ''},{' '}
                      {pendingAddress?.formatted?.city || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information Fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#20313A]">
                  <Building className="h-4 w-4" />
                  <p className="text-sm font-medium">Información adicional (opcional)</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="floor" className="text-sm text-[#20313A]">
                      Piso
                    </Label>
                    <Input
                      id="floor"
                      placeholder="Ej: 3"
                      value={additionalInfo.floor}
                      onChange={(e) => handleAdditionalInfoChange('floor', e.target.value)}
                      className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apartment" className="text-sm text-[#20313A]">
                      Departamento
                    </Label>
                    <Input
                      id="apartment"
                      placeholder="Ej: A, 12"
                      value={additionalInfo.apartment}
                      onChange={(e) => handleAdditionalInfoChange('apartment', e.target.value)}
                      className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building" className="text-sm text-[#20313A]">
                    Edificio / Complejo
                  </Label>
                  <Input
                    id="building"
                    placeholder="Ej: Torre Norte, Edificio San Martín"
                    value={additionalInfo.building}
                    onChange={(e) => handleAdditionalInfoChange('building', e.target.value)}
                    className="border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSkipAdditionalInfo}
                  disabled={updateAddressMutation.isPending}
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent"
                >
                  Omitir
                </Button>
                <Button
                  onClick={handleFinalConfirmation}
                  disabled={updateAddressMutation.isPending}
                  className="flex-1 bg-[#9EE493] hover:bg-[#8BD480] text-[#20313A]"
                >
                  {updateAddressMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Confirmar Dirección'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
