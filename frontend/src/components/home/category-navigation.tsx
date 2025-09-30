'use client';

import { JSX, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { CategoryUtils } from '@/lib/utils/categoryUtils';
import type { Gender, ProductCategory } from '@/types/product';
import { cn } from '@/lib/utils';

interface CategoryNavigationProps {
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
}

export function CategoryNavigation({ selectedCategory, onCategoryChange }: CategoryNavigationProps) {
  const [openGender, setOpenGender] = useState<Gender | null>(null);

  // Get all categories grouped by gender
  const categoryTree = CategoryUtils.getCategoryTree();

  // Main categories
  const mainCategories: { key: Gender; label: string }[] = [
    { key: 'hombre', label: 'Hombre' },
    { key: 'mujer', label: 'Mujer' },
    { key: 'ninos', label: 'Niños' },
  ];

  const getSelectedGender = (): Gender | null => {
    if (!selectedCategory) return null;
    // Check for exact gender match first (for "Ver Todo")
    if (selectedCategory === 'hombre' || selectedCategory === 'mujer' || selectedCategory === 'ninos') {
      return selectedCategory as Gender;
    }
    // Then check for category starting with gender
    if (selectedCategory.startsWith('hombre')) return 'hombre';
    if (selectedCategory.startsWith('mujer')) return 'mujer';
    if (selectedCategory.startsWith('ninos')) return 'ninos';
    return null;
  };

  const selectedGender = getSelectedGender();

  const handleCategoryClick = (category: string | undefined) => {
    onCategoryChange(category);
    setOpenGender(null);
  };

  return (
    <div className="border-b border-gray-200 bg-white mb-4">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3 px-1">
        {/* All Products Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCategoryClick(undefined)}
          className={cn(
            'whitespace-nowrap h-9 px-4',
            !selectedCategory ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]' : 'text-gray-700 hover:bg-gray-100',
          )}
        >
          Todos
        </Button>

        {/* Main Category Buttons with Dropdowns */}
        {mainCategories.map((category) => (
          <DropdownMenu
            key={category.key}
            open={openGender === category.key}
            onOpenChange={(open) => setOpenGender(open ? category.key : null)}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'whitespace-nowrap h-9 px-4',
                  selectedGender === category.key
                    ? 'bg-[#9EE493] text-[#20313A] hover:bg-[#8BD480]'
                    : 'text-gray-700 hover:bg-gray-100',
                )}
              >
                {category.label}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-[70vh] overflow-y-auto">
              <DropdownMenuLabel>{category.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Ver Todo option - shows all products from this gender */}
              <DropdownMenuItem
                onClick={() => handleCategoryClick(category.key)}
                className="cursor-pointer font-semibold"
              >
                Ver Todo
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Render subcategories */}
              {category.key === 'hombre' &&
                renderHombreCategories(categoryTree.hombre, handleCategoryClick, selectedCategory)}
              {category.key === 'mujer' &&
                renderMujerCategories(categoryTree.mujer, handleCategoryClick, selectedCategory)}
              {category.key === 'ninos' &&
                renderNinosCategories(categoryTree.ninos, handleCategoryClick, selectedCategory)}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  );
}

// Helper functions to render category menus
function renderHombreCategories(
  categories: Record<string, any>,
  onClick: (category: string) => void,
  selectedCategory?: string,
) {
  return Object.entries(categories)
    .filter(([key]) => key !== 'ver-todo')
    .slice(0, 12)
    .map(([key, config]) => (
      <DropdownMenuItem
        key={config.key}
        onClick={() => onClick(config.key)}
        className={cn('cursor-pointer', selectedCategory === config.key && 'bg-[#DBF7DC]')}
      >
        {config.displayName}
      </DropdownMenuItem>
    ));
}

function renderMujerCategories(
  categories: Record<string, any>,
  onClick: (category: string) => void,
  selectedCategory?: string,
) {
  return Object.entries(categories)
    .filter(([key]) => key !== 'ver-todo')
    .slice(0, 12)
    .map(([key, config]) => (
      <DropdownMenuItem
        key={config.key}
        onClick={() => onClick(config.key)}
        className={cn('cursor-pointer', selectedCategory === config.key && 'bg-[#DBF7DC]')}
      >
        {config.displayName}
      </DropdownMenuItem>
    ));
}

function renderNinosCategories(categories: any, onClick: (category: string) => void, selectedCategory?: string) {
  // Niños has nested structure: nina/nino/bebe -> age groups -> subcategories
  return (
    <>
      <DropdownMenuLabel className="text-xs text-gray-500">Niña</DropdownMenuLabel>
      {renderAgeGroupCategories(categories.nina, onClick, selectedCategory, 'nina')}

      <DropdownMenuSeparator />

      <DropdownMenuLabel className="text-xs text-gray-500">Niño</DropdownMenuLabel>
      {renderAgeGroupCategories(categories.nino, onClick, selectedCategory, 'nino')}

      <DropdownMenuSeparator />

      <DropdownMenuLabel className="text-xs text-gray-500">Bebé</DropdownMenuLabel>
      {renderBabyCategories(categories.bebe, onClick, selectedCategory)}
    </>
  );
}

function renderAgeGroupCategories(
  ageGroups: any,
  onClick: (category: string) => void,
  selectedCategory: string | undefined,
  gender: 'nina' | 'nino',
) {
  const categories: JSX.Element[] = [];

  // Render 1-6 age group categories
  Object.entries(ageGroups['1-6'] || {})
    .slice(0, 5)
    .forEach(([key, config]: [string, any]) => {
      categories.push(
        <DropdownMenuItem
          key={config.key}
          onClick={() => onClick(config.key)}
          className={cn('cursor-pointer text-sm', selectedCategory === config.key && 'bg-[#DBF7DC]')}
        >
          {config.displayName} (1-6)
        </DropdownMenuItem>,
      );
    });

  return categories;
}

function renderBabyCategories(babyCategories: any, onClick: (category: string) => void, selectedCategory?: string) {
  return Object.entries(babyCategories['0-18m'] || {})
    .slice(0, 5)
    .map(([key, config]: [string, any]) => (
      <DropdownMenuItem
        key={config.key}
        onClick={() => onClick(config.key)}
        className={cn('cursor-pointer text-sm', selectedCategory === config.key && 'bg-[#DBF7DC]')}
      >
        {config.displayName}
      </DropdownMenuItem>
    ));
}
