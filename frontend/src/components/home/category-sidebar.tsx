'use client';

import { useState } from 'react';
import { ChevronDown, X, Menu } from 'lucide-react';
import { CategoryUtils, CATEGORY_CONFIG } from '@/lib/utils/categoryUtils';
import type { Gender, ProductCategory, CategoryDisplayInfo } from '@/types/product';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface CategorySidebarProps {
  gender: Gender;
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
  className?: string;
}

export function CategorySidebar({ gender, selectedCategory, onCategoryChange, className }: CategorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const categoryTree = CategoryUtils.getCategoryTree();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCategoryClick = (category: string | undefined) => {
    onCategoryChange(category);
    // Close mobile menu after selection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const renderCategories = () => {
    if (gender === 'hombre' || gender === 'mujer') {
      const categories = gender === 'hombre' ? categoryTree.hombre : categoryTree.mujer;

      return (
        <div className="space-y-1">
          {/* "Ver Todo" option */}
          <button
            onClick={() => handleCategoryClick(gender)}
            className={cn(
              'w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-md',
              selectedCategory === gender
                ? 'bg-[#9EE493] text-[#20313A]'
                : 'text-gray-700 hover:bg-gray-100',
            )}
          >
            Ver Todo
          </button>

          <div className="h-px bg-gray-200 my-2" />

          {/* Subcategories */}
          {Object.entries(categories)
            .filter(([key]) => key !== 'ver-todo')
            .map(([key, config]) => (
              <button
                key={config.key}
                onClick={() => handleCategoryClick(config.key)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors rounded-md',
                  selectedCategory === config.key
                    ? 'bg-[#9EE493] text-[#20313A] font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                {config.displayName}
              </button>
            ))}
        </div>
      );
    }

    if (gender === 'ninos') {
      return (
        <div className="space-y-1">
          {/* "Ver Todo" option */}
          <button
            onClick={() => handleCategoryClick('ninos')}
            className={cn(
              'w-full text-left px-4 py-2.5 text-sm font-medium transition-colors rounded-md',
              selectedCategory === 'ninos'
                ? 'bg-[#9EE493] text-[#20313A]'
                : 'text-gray-700 hover:bg-gray-100',
            )}
          >
            Ver Todo
          </button>

          <div className="h-px bg-gray-200 my-2" />

          {/* Niña Section */}
          <CollapsibleSection
            title="Niña"
            isExpanded={expandedSections.has('nina')}
            onToggle={() => toggleSection('nina')}
          >
            {renderAgeGroupSection(categoryTree.ninos.nina, 'nina', '1-6', handleCategoryClick, selectedCategory)}
          </CollapsibleSection>

          {/* Niño Section */}
          <CollapsibleSection
            title="Niño"
            isExpanded={expandedSections.has('nino')}
            onToggle={() => toggleSection('nino')}
          >
            {renderAgeGroupSection(categoryTree.ninos.nino, 'nino', '1-6', handleCategoryClick, selectedCategory)}
          </CollapsibleSection>

          {/* Bebé Section */}
          <CollapsibleSection
            title="Bebé (0-18m)"
            isExpanded={expandedSections.has('bebe')}
            onToggle={() => toggleSection('bebe')}
          >
            <div className="space-y-1 pl-2">
              {Object.entries(categoryTree.ninos.bebe['0-18m'])
                .filter(([key]) => key !== 'ver-todo')
                .map(([key, config]) => (
                  <button
                    key={config.key}
                    onClick={() => handleCategoryClick(config.key)}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm transition-colors rounded-md',
                      selectedCategory === config.key
                        ? 'bg-[#9EE493] text-[#20313A] font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                  >
                    {config.displayName}
                  </button>
                ))}
            </div>
          </CollapsibleSection>
        </div>
      );
    }

    return null;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b md:hidden">
        <h2 className="text-lg font-semibold text-gray-900">Categorías</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          {gender === 'hombre' && 'Hombre'}
          {gender === 'mujer' && 'Mujer'}
          {gender === 'ninos' && 'Niños'}
        </h2>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderCategories()}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="md:hidden fixed bottom-4 right-4 z-40 shadow-lg"
      >
        <Menu className="h-4 w-4 mr-2" />
        Categorías
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:block w-64 bg-white border-r border-gray-200 sticky top-0 h-[calc(100vh-4rem)]',
          className,
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isExpanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-md"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="py-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper function to render age group categories
function renderAgeGroupSection(
  ageGroups: any,
  childGender: 'nina' | 'nino',
  defaultAge: '1-6' | '6-14',
  onClick: (category: string) => void,
  selectedCategory?: string,
) {
  // For simplicity, show all categories from both age groups together
  const allCategories: CategoryDisplayInfo[] = [];

  Object.entries(ageGroups['1-6'] || {})
    .filter(([key]) => key !== 'ver-todo')
    .forEach(([key, config]) => {
      allCategories.push(config as CategoryDisplayInfo);
    });

  Object.entries(ageGroups['6-14'] || {})
    .filter(([key]) => key !== 'ver-todo')
    .forEach(([key, config]) => {
      const existing = allCategories.find(c => c.displayName === (config as CategoryDisplayInfo).displayName);
      if (!existing) {
        allCategories.push(config as CategoryDisplayInfo);
      }
    });

  return (
    <div className="space-y-1 pl-2">
      {allCategories.map((config) => (
        <button
          key={config.key}
          onClick={() => onClick(config.key)}
          className={cn(
            'w-full text-left px-4 py-2 text-sm transition-colors rounded-md',
            selectedCategory === config.key
              ? 'bg-[#9EE493] text-[#20313A] font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          )}
        >
          {config.displayName}
        </button>
      ))}
    </div>
  );
}
