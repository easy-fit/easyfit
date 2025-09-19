'use client';

import { ChevronLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutUsPage() {
  const router = useRouter();

  const founders = [
    {
      name: 'Felipe Pontiggia',
      role: 'CTO & Co-Fundador',
    },
    {
      name: 'Nicolas Pussetto',
      role: 'CEO & Co-Fundador',
    },
    {
      name: 'Benjamin Olivi',
      role: 'CMO & Co-Fundador',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#20313A] hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-[#20313A]">Acerca de Nosotros</h1>
              <p className="text-sm text-gray-600">Conocé la historia detrás de EasyFit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section - Simplified */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#9EE493] to-[#7BC87C] rounded-full flex items-center justify-center p-4">
                  <Image src="/Icon-1.png" alt="EasyFit Logo" width={42} height={42} className="object-contain" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#20313A] mb-4">
              Revolucionando la forma de comprar ropa
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Probá antes de comprar, en la comodidad de tu casa
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Our Story */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-[#20313A] mb-6">Nuestra Historia</h3>
              <div className="prose prose-lg max-w-none">
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p>
                    <strong>EasyFit no empezó como una app, sino como una marca de ropa.</strong>&nbsp;En ese camino,
                    nos dimos cuenta de algo: lo que más valoraba la gente no era solo la prenda, sino la posibilidad de
                    probarla en su casa, tranquila y sin presiones. Ese diferencial se convirtió en la semilla de todo.
                  </p>
                  <p>
                    Al revisar esa idea, vimos que tenía mucho más potencial como un servicio que como una simple marca.
                    Así nació <strong>EasyFit</strong>, un sistema pensado para que pedir y probar ropa sea tan fácil
                    como pedir un delivery.
                  </p>
                  <p>
                    Desde entonces, trabajamos todos los días en llevar adelante esta revolución: cambiar la forma en
                    que las personas compran ropa y la forma en que las tiendas se conectan con sus clientes.
                  </p>
                </div>
              </div>
            </div>

            {/* Founders Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-[#20313A] mb-8 text-center">Equipo Fundador</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {founders.map((founder, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-40 h-40 mx-auto mb-6">
                      {founder.name === 'Felipe Pontiggia' ? (
                        <div className="w-full h-full rounded-full overflow-hidden shadow-lg">
                          <Image
                            src="/felipe.jpg"
                            alt="Felipe Pontiggia"
                            width={160}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#9EE493] to-[#7BC87C] rounded-full flex items-center justify-center shadow-lg">
                          <Users className="h-20 w-20 text-white" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-semibold text-[#20313A] mb-2">{founder.name}</h4>
                    <p className="text-[#20313A] font-medium text-base mb-4">{founder.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Mission */}
            <div className="bg-gradient-to-r from-[#9EE493] to-[#8dd482] rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-[#20313A] mb-4">Nuestra Misión</h3>
              <p className="text-[#20313A] text-lg leading-relaxed font-medium max-w-3xl mx-auto">
                Democratizar el acceso a la ropa, eliminando las barreras entre las tiendas y los clientes, creando una
                experiencia de compra más humana, segura y confiable.
              </p>
            </div>
          </div>

          {/* Simple Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center">
            <Link href="/" className="text-sm text-[#20313A] hover:text-[#9EE493] transition-colors">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
