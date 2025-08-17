import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TagSelector } from '@/components/ui/tag-selector';
import { Tag } from 'lucide-react';
import { StoreSettingsFormValues } from '@/constants/store-settings';

interface StoreTagsSectionProps {
  form: UseFormReturn<StoreSettingsFormValues>;
}

export function StoreTagsSection({ form }: StoreTagsSectionProps) {
  return (
    <Card className="shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#20313A] text-xl">
          <div className="p-2 bg-[#DBF7DC] rounded-lg">
            <Tag className="h-5 w-5 text-[#20313A]" />
          </div>
          Etiquetas
        </CardTitle>
        <CardDescription className="text-gray-600">
          Selecciona las etiquetas que mejor describan tu tienda y productos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TagSelector
          selectedTags={form.watch('tags')}
          onTagsChange={(tags) => form.setValue('tags', tags)}
          placeholder="Seleccionar etiquetas para tu tienda..."
          maxTags={5}
        />
      </CardContent>
    </Card>
  );
}