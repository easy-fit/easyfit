'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <Image src="/favicon.ico" alt="EasyFit" fill className="object-contain" />
              </div>
              <span className="text-lg font-bold text-[#20313A]">EasyFit</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Probá antes de comprar. La forma más fácil y segura de descubrir tu nueva ropa favorita.
            </p>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#20313A]">Empresa</h3>
            <div className="space-y-2">
              <Link
                href="/about/sobre-nosotros"
                className="block text-sm text-gray-600 hover:text-[#20313A] transition-colors"
              >
                Sobre Nosotros
              </Link>
              <a
                href="https://app.easyfit.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-600 hover:text-[#20313A] transition-colors"
              >
                Cómo Funciona
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#20313A]">Soporte</h3>
            <div className="space-y-2">
              <Link
                href="/about/centro-de-ayuda"
                className="block text-sm text-gray-600 hover:text-[#20313A] transition-colors"
              >
                Centro de Ayuda
              </Link>
              <Link
                href="/about/preguntas-frecuentes"
                className="block text-sm text-gray-600 hover:text-[#20313A] transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#20313A]">Legal</h3>
            <div className="space-y-2">
              <Link
                href="/about/terminos-y-condiciones"
                className="block text-sm text-gray-600 hover:text-[#20313A] transition-colors"
              >
                Términos y Condiciones
              </Link>
              <Link
                href="/about/politicas-de-privacidad"
                className="block text-sm text-gray-600 hover:text-[#20313A] transition-colors"
              >
                Políticas de Privacidad
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">© 2025 EasyFit. Todos los derechos reservados.</div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link
              href="https://instagram.com/easyfit.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-[#20313A] transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="https://www.tiktok.com/@easyfit.argentina"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-[#20313A] transition-colors"
            >
              Tiktok
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
