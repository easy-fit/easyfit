import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { StoreSettingsFormValues, dayLabels } from '@/constants/store-settings';

interface StoreHoursSectionProps {
  form: UseFormReturn<StoreSettingsFormValues>;
}

export function StoreHoursSection({ form }: StoreHoursSectionProps) {
  const pickupHours = form.watch('pickupHours');

  const updateHour = (index: number, field: 'open' | 'close', value: string) => {
    const newHours = [...pickupHours];
    newHours[index] = { ...newHours[index], [field]: value };
    form.setValue('pickupHours', newHours);
  };

  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
          <div className="p-2 bg-[#DBF7DC] rounded-lg">
            <Clock className="h-5 w-5 text-[#20313A]" />
          </div>
          Horarios de Atención
        </CardTitle>
        <CardDescription className="text-gray-600">Configura los horarios de retiro en tu tienda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pickupHours.map((hours, index) => (
            <div key={hours.day} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-[#20313A] block">{dayLabels[hours.day]}</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">Abre:</span>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateHour(index, 'open', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9EE493] focus-visible:border-[#9EE493] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">Cierra:</span>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateHour(index, 'close', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9EE493] focus-visible:border-[#9EE493] disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
