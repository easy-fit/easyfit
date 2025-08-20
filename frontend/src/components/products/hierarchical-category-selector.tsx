'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CategoryUtils } from '@/lib/utils/categoryUtils';
import type { ProductCategory, Gender, AgeGroup } from '@/types/product';

interface HierarchicalCategorySelectorProps {
  value?: ProductCategory;
  onValueChange: (value: ProductCategory) => void;
  placeholder?: string;
}

export function HierarchicalCategorySelector({
  value,
  onValueChange,
  placeholder = 'Seleccionar categoría',
}: HierarchicalCategorySelectorProps) {
  const [selectedGender, setSelectedGender] = React.useState<Gender | ''>('');
  const [selectedChildGender, setSelectedChildGender] = React.useState<'nina' | 'nino' | 'bebe' | ''>('');
  const [selectedAgeGroup, setSelectedAgeGroup] = React.useState<AgeGroup | ''>('');

  // Parse current value to set selectors
  React.useEffect(() => {
    if (value) {
      const parts = value.split('.');
      setSelectedGender(parts[0] as Gender);

      if (parts[0] === 'ninos') {
        setSelectedChildGender(parts[1] as 'nina' | 'nino' | 'bebe');
        if (parts[2]) {
          setSelectedAgeGroup(parts[2] as AgeGroup);
        }
      }
    } else {
      setSelectedGender('');
      setSelectedChildGender('');
      setSelectedAgeGroup('');
    }
  }, [value]);

  const handleGenderChange = (gender: Gender) => {
    setSelectedGender(gender);
    setSelectedChildGender('');
    setSelectedAgeGroup('');
    // Don't set category yet, wait for full selection
  };

  const handleChildGenderChange = (childGender: 'nina' | 'nino' | 'bebe') => {
    setSelectedChildGender(childGender);
    setSelectedAgeGroup('');
    // Don't set category yet, wait for full selection
  };

  const handleAgeGroupChange = (ageGroup: AgeGroup) => {
    setSelectedAgeGroup(ageGroup);
    // Don't set category yet, wait for subcategory selection
  };

  const handleSubcategoryChange = (subcategory: string) => {
    let fullCategory: string;

    if (selectedGender === 'ninos') {
      fullCategory = `${selectedGender}.${selectedChildGender}.${selectedAgeGroup}.${subcategory}`;
    } else {
      fullCategory = `${selectedGender}.${subcategory}`;
    }

    onValueChange(fullCategory as ProductCategory);
  };

  const getAvailableSubcategories = () => {
    if (!selectedGender) return [];

    if (selectedGender === 'ninos') {
      if (!selectedChildGender || !selectedAgeGroup) return [];
      const prefix = `${selectedGender}.${selectedChildGender}.${selectedAgeGroup}`;
      return CategoryUtils.getSubcategories(prefix);
    } else {
      return CategoryUtils.getSubcategories(selectedGender);
    }
  };

  const getCurrentBreadcrumb = () => {
    if (!value) return null;
    return CategoryUtils.getBreadcrumb(value);
  };

  const breadcrumb = getCurrentBreadcrumb();

  return (
    <div className="space-y-4">
      {/* Current Selection Breadcrumb */}
      {breadcrumb && (
        <div className="flex items-center gap-2 flex-wrap">
          <Label className="text-sm text-gray-600">Seleccionado:</Label>
          <div className="flex items-center gap-1 flex-wrap">
            {breadcrumb.map((crumb, index) => (
              <React.Fragment key={index}>
                <Badge variant="secondary" className="text-xs">
                  {crumb}
                </Badge>
                {index < breadcrumb.length - 1 && <ChevronDown className="h-3 w-3 text-gray-400 rotate-[-90deg]" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Category Selection Steps - Side by Side Layout */}
      <div className="space-y-4">
        {/* Step 1 & 2: Gender and Child Gender (side by side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>1. Seleccionar Género</Label>
            <Select value={selectedGender} onValueChange={handleGenderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hombre">Hombre</SelectItem>
                <SelectItem value="mujer">Mujer</SelectItem>
                <SelectItem value="ninos">Niños</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Child Gender Selection (only for ninos) */}
          {selectedGender === 'ninos' && (
            <div className="space-y-2">
              <Label>2. Seleccionar Tipo</Label>
              <Select value={selectedChildGender} onValueChange={handleChildGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nina">Niña</SelectItem>
                  <SelectItem value="nino">Niño</SelectItem>
                  <SelectItem value="bebe">Bebé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 2: Subcategory Selection (for hombre/mujer) */}
          {selectedGender !== 'ninos' && selectedGender && (
            <div className="space-y-2">
              <Label>2. Seleccionar Subcategoría</Label>
              <Select onValueChange={handleSubcategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSubcategories().map((category) => {
                    const parts = category.split('.');
                    const subcategory = parts[parts.length - 1];
                    const displayName = CategoryUtils.getCategoryDisplayName(category);

                    return (
                      <SelectItem key={category} value={subcategory}>
                        {displayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Step 3: Age Group Selection (only for ninos, side by side with step 4) */}
        {selectedGender === 'ninos' && selectedChildGender && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>3. Seleccionar Edad</Label>
              <Select value={selectedAgeGroup} onValueChange={handleAgeGroupChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar edad" />
                </SelectTrigger>
                <SelectContent>
                  {selectedChildGender === 'bebe' ? (
                    <SelectItem value="0-18m">0 - 18 meses</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="1-6">1½ - 6 años</SelectItem>
                      <SelectItem value="6-14">6 - 14 años</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Step 4: Subcategory Selection (for ninos) */}
            {selectedAgeGroup && (
              <div className="space-y-2">
                <Label>4. Seleccionar Subcategoría</Label>
                <Select onValueChange={handleSubcategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableSubcategories().map((category) => {
                      const parts = category.split('.');
                      const subcategory = parts[parts.length - 1];
                      const displayName = CategoryUtils.getCategoryDisplayName(category);

                      return (
                        <SelectItem key={category} value={subcategory}>
                          {displayName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
