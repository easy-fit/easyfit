'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoryUtils } from '@/lib/utils/categoryUtils';
import type { ProductCategory } from '@/types/product';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  category?: string;
  className?: string;
}

export function Breadcrumb({ category, className }: BreadcrumbProps) {
  if (!category) return null;

  // Check if it's a valid product category
  if (!CategoryUtils.isValidCategory(category)) {
    // It might be just a gender (hombre, mujer, ninos)
    const genderMap: Record<string, string> = {
      hombre: 'Hombre',
      mujer: 'Mujer',
      ninos: 'Niños',
    };

    if (genderMap[category]) {
      return (
        <nav className={cn('flex items-center text-sm text-gray-600 mb-4', className)}>
          <Link href="/" className="hover:text-gray-900 transition-colors">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-gray-900 font-medium">{genderMap[category]}</span>
        </nav>
      );
    }

    return null;
  }

  const hierarchy = CategoryUtils.getCategoryHierarchy(category as ProductCategory);

  return (
    <nav className={cn('flex items-center flex-wrap text-sm text-gray-600 mb-4', className)}>
      <Link href="/" className="hover:text-gray-900 transition-colors">
        Inicio
      </Link>

      {hierarchy.map((item, index) => {
        const isLast = index === hierarchy.length - 1;
        const isGender = item.level === 'main';

        // Build the URL for this level
        let href = '/';
        if (isGender) {
          href = `/?gender=${item.key}&view=products`;
        } else {
          // For subcategories, link to the specific category
          href = `/?gender=${hierarchy[0].key}&view=products`; // Keep the gender in URL
        }

        return (
          <div key={item.key} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{item.displayName}</span>
            ) : (
              <Link href={href} className="hover:text-gray-900 transition-colors">
                {item.displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
