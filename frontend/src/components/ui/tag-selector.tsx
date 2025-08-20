'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STORE_TAG_CATEGORIES, STORE_TAG_LABELS, type StoreTag } from '@/constants/store-tags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagSelector({ selectedTags, onTagsChange, placeholder = 'Seleccionar etiquetas...', className, maxTags = 5 }: TagSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const toggleTag = (tagValue: string) => {
    if (selectedTags.includes(tagValue)) {
      // Remove tag
      const newTags = selectedTags.filter((tag) => tag !== tagValue);
      onTagsChange(newTags);
    } else {
      // Add tag only if under the limit
      if (selectedTags.length < maxTags) {
        const newTags = [...selectedTags, tagValue];
        onTagsChange(newTags);
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#20313A]">
              Etiquetas seleccionadas ({selectedTags.length}/{maxTags}):
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllTags}
              className="h-auto p-1 text-xs text-gray-500 hover:text-red-600"
            >
              Limpiar todo
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-[#DBF7DC] text-[#20313A] border-[#9EE493] px-3 py-1 text-sm flex items-center gap-2"
              >
                {STORE_TAG_LABELS[tag as StoreTag] || tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-[#9EE493] rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tag Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 border-gray-200 focus:border-[#9EE493] focus:ring-[#9EE493]"
          >
            {selectedTags.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <span className="text-[#20313A]">
                {selectedTags.length === 1 
                  ? STORE_TAG_LABELS[selectedTags[0] as StoreTag] || selectedTags[0]
                  : `${selectedTags.length}/${maxTags} etiquetas seleccionadas`
                }
                {selectedTags.length >= maxTags && (
                  <span className="text-orange-600 ml-1">(máximo alcanzado)</span>
                )}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start" side="bottom" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Buscar etiquetas..." className="border-0 focus:ring-0" />
            <CommandEmpty>No se encontraron etiquetas.</CommandEmpty>
            <div className="max-h-[300px] overflow-auto">
            
            {Object.entries(STORE_TAG_CATEGORIES).map(([categoryKey, category]) => (
              <CommandGroup key={categoryKey} heading={category.label}>
                {category.tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const isDisabled = !isSelected && selectedTags.length >= maxTags;
                  
                  return (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => !isDisabled && toggleTag(tag)}
                      className={cn(
                        "flex items-center space-x-2",
                        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      )}
                      disabled={isDisabled}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-[#9EE493] text-[#20313A]"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span className={cn(isDisabled && "text-gray-400")}>
                        {STORE_TAG_LABELS[tag]}
                      </span>
                      {isDisabled && !isSelected && (
                        <span className="text-xs text-orange-600 ml-auto">Límite alcanzado</span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}