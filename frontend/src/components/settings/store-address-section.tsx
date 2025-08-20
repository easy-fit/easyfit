import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Edit3 } from 'lucide-react';
import { StoreSettingsFormValues } from '@/constants/store-settings';
import type { Store } from '@/types/store';

interface StoreAddressSectionProps {
  form: UseFormReturn<StoreSettingsFormValues>;
  store: Store;
  onChangeAddress: () => void;
}

export function StoreAddressSection({ form, store, onChangeAddress }: StoreAddressSectionProps) {
  const currentAddress = form.watch('address') || store.address;
  
  const formatAddress = () => {
    if (!currentAddress?.formatted) return 'Sin dirección configurada';
    
    const { street, streetNumber, apartment, floor, city } = currentAddress.formatted;
    let address = `${street} ${streetNumber}`;
    
    if (apartment) {
      address += `, Depto ${apartment}`;
    }
    if (floor) {
      address += `, Piso ${floor}`;
    }
    address += `, ${city}`;
    
    return address;
  };

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
          <div className="p-2 bg-[#DBF7DC] rounded-lg">
            <MapPin className="h-5 w-5 text-[#20313A]" />
          </div>
          Dirección
        </CardTitle>
        <CardDescription className="text-gray-600">
          Configura la ubicación de tu tienda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-[#DBF7DC]/20 p-4 rounded-lg border border-[#DBF7DC]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#9EE493] rounded-full">
                <MapPin className="h-4 w-4 text-[#20313A]" />
              </div>
              <div>
                <p className="font-medium text-[#20313A]">Dirección Actual</p>
                <p className="text-sm text-gray-600">{formatAddress()}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onChangeAddress}
              className="border-[#9EE493] hover:bg-[#DBF7DC] text-[#20313A]"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}