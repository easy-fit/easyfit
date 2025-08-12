'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';

export function ProductBenefits() {
  return (
    <>
      <Separator />

      {/* Additional Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">¿Cómo funciona?</h4>
              <p className="text-sm text-blue-800">
                Elegí lo que te gusta, lo recibís en casa, probás con calma y solo pagás por lo que decidís quedarte.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
