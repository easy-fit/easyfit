'use client';

import { ChevronLeft, MessageCircle, Mail, Phone, Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CentroDeAyudaPage() {
  const router = useRouter();

  const whatsappNumber = '5492914436642'; // +54 9 2914 43‑6642 formatted for WhatsApp URL
  const whatsappMessage = 'Hola! Necesito ayuda con EasyFit';

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

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
              <h1 className="text-xl font-bold text-[#20313A]">Centro de Ayuda</h1>
              <p className="text-sm text-gray-600">Estamos aquí para ayudarte</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Introduction */}
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#20313A] mb-4">¿Necesitás ayuda?</h2>
              <p className="text-gray-700 leading-relaxed">
                Nuestro equipo de soporte está disponible para resolver todas tus dudas sobre EasyFit. Elegí la opción
                que mejor se adapte a tu consulta.
              </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* WhatsApp - Primary Option */}
              <div
                className="bg-[#25D366] text-white rounded-lg p-6 hover:bg-[#22c55e] transition-colors cursor-pointer"
                onClick={handleWhatsAppClick}
              >
                <div className="flex items-start gap-4">
                  <MessageCircle className="h-8 w-8 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">WhatsApp</h3>
                    <p className="text-sm opacity-90 mb-3">
                      La forma más rápida de contactarnos. Te respondemos al instante.
                    </p>
                    <div className="text-sm font-medium">+54 9 2914 43‑6642</div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-4">
                  <Mail className="h-8 w-8 flex-shrink-0 mt-1 text-[#20313A]" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#20313A] mb-2">Email</h3>
                    <p className="text-sm text-gray-600 mb-3">Para consultas detalladas o temas específicos.</p>
                    <Link
                      href="mailto:legal@easyfit.com.ar"
                      className="text-sm font-medium text-[#20313A] hover:text-[#9EE493] transition-colors"
                    >
                      soporte@easyfit.com.ar
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Hours */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Horarios de Atención</h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>
                      <strong>Lunes a Viernes:</strong> 9:00 - 20:00 hs
                    </p>
                    <p>
                      <strong>Sábados:</strong> 10:00 - 18:00 hs
                    </p>
                    <p>
                      <strong>Domingos:</strong> 10:00 - 16:00 hs
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Horarios Argentina (GMT-3). Fuera de estos horarios, respondemos a la brevedad.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#20313A] flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Ayuda Rápida
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/preguntas-frecuentes"
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-[#20313A]">Preguntas Frecuentes</div>
                    <div className="text-sm text-gray-600">Respuestas a las consultas más comunes</div>
                  </Link>
                  <Link
                    href="/about/terminos-y-condiciones"
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-[#20313A]">Términos y Condiciones</div>
                    <div className="text-sm text-gray-600">Conocé nuestras políticas y condiciones</div>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#20313A]">Temas Comunes</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-gray-50 rounded">
                    <strong>Proceso de Prueba:</strong> Cómo funciona el período de prueba
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <strong>Pagos y Facturación:</strong> Métodos de pago y facturación
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <strong>Devoluciones:</strong> Política de devoluciones y cambios
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <strong>Cobertura:</strong> Zonas de entrega disponibles
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleWhatsAppClick}
                className="bg-[#25D366] hover:bg-[#22c55e] text-white px-8 py-3 text-lg"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Contactar por WhatsApp
              </Button>
              <p className="text-sm text-gray-600 mt-2">Te responderemos lo antes posible</p>
            </div>
            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-4">
                  <Link href="/" className="text-sm text-[#20313A] hover:text-[#9EE493] transition-colors">
                    Inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
