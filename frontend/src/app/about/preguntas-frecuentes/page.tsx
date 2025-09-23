'use client';

import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function FAQPage() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const faqSections = [
    {
      id: 'general',
      title: 'General',
      questions: [
        {
          question: '¿Qué es EasyFit?',
          answer:
            'EasyFit es una plataforma que te permite probar ropa antes de comprarla. Conectamos usuarios con tiendas locales y riders para que puedas probarte las prendas en la comodidad de tu hogar antes de decidir si las compras.',
        },
        {
          question: '¿Cómo funciona el servicio?',
          answer:
            'Seleccionas las prendas que te interesan, un rider las retira de la tienda y te las lleva a tu domicilio. Tienes tiempo para probarlas y decidir cuáles comprar. Las que no te quedes, el rider se las lleva de vuelta.',
        },
        {
          question: '¿En qué zonas están disponibles?',
          answer:
            'Actualmente operamos en Bahía Blanca y zona. Estamos expandiendo nuestro servicio a nuevas ciudades. Podés verificar la cobertura en tu área al ingresar tu dirección en la aplicación.',
        },
      ],
    },
    {
      id: 'pedidos',
      title: 'Pedidos y Entregas',
      questions: [
        {
          question: '¿Cuánto tiempo tengo para probar las prendas?',
          answer:
            'Tenés hasta 10 minutos para el envío estándar y hasta 17 minutos para el envío premium para probar todas las prendas y decidir cuáles comprás.',
        },
        {
          question: '¿Cuánto cuesta el envío?',
          answer:
            'El costo del envío se calcula según la distancia, horario y disponibilidad de riders. El precio exacto se muestra antes de confirmar tu pedido en la aplicación.',
        },
        {
          question: '¿Qué pasa si no estoy en casa cuando llega el rider?',
          answer:
            'Si no estás en el domicilio, el rider devolverá las prendas a la tienda y se cobrará únicamente el costo de envío.',
        },
      ],
    },
    {
      id: 'pagos',
      title: 'Pagos y Facturación',
      questions: [
        {
          question: '¿Cuándo se cobra el pedido?',
          answer:
            'Solo se cobra por las prendas que decides comprar después de probarlas, más el costo del servicio de entrega.',
        },
        {
          question: '¿Qué métodos de pago aceptan?',
          answer:
            'Aceptamos tarjetas de débito, crédito y otros medios de pago electrónicos. También ofrecemos opciones de pago en cuotas según disponibilidad.',
        },
        {
          question: '¿Puedo obtener factura?',
          answer:
            'Sí, las tiendas emiten los comprobantes fiscales correspondientes por la compra de prendas. EasyFit puede remitir estos comprobantes de manera electrónica.',
        },
      ],
    },
    {
      id: 'devoluciones',
      title: 'Devoluciones y Cambios',
      questions: [
        {
          question: '¿Qué prendas puedo probar?',
          answer:
            'Podés probar la mayoría de las prendas excepto ropa interior, lencería, medias, perfumes, cosméticos, bijouterie y cinturones. Sí se permite probar gorras, sombreros y zapatillas.',
        },
        {
          question: '¿Puedo cancelar mi pedido?',
          answer:
            'Podés cancelar sin costo antes de que el rider acepte el servicio o la tienda comience a preparar el pedido. Después de eso, se puede aplicar una penalidad hasta el 100% del costo de envío.',
        },
      ],
    },
    {
      id: 'riders',
      title: 'Riders y Entrega',
      questions: [
        {
          question: '¿Los riders pueden ingresar a mi domicilio?',
          answer:
            'No, está expresamente prohibido el ingreso del rider al domicilio. Deben permanecer en la puerta o en el palier mientras probás las prendas.',
        },
        {
          question: '¿Cómo verifico la identidad del rider?',
          answer:
            'Todos los riders pasan por un proceso de validación que incluye verificación biométrica, documentación del vehículo y seguro vigente. Al momento de la entrega, te proporcionarán un código de seguridad.',
        },
        {
          question: '¿Qué pasa si el rider no llega?',
          answer:
            'Si un rider no acepta o responde el pedido dentro de los 30 segundos, se reasigna automáticamente a otro rider disponible.',
        },
      ],
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
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[#20313A] hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-[#20313A]">Preguntas Frecuentes</h1>
              <p className="text-sm text-gray-600">Encontrá respuestas a las consultas más comunes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Introduction */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">
                Aquí encontrarás respuestas a las preguntas más frecuentes sobre EasyFit. Si no encontrás lo que buscás,
                no dudes en contactarnos a través de nuestro Centro de Ayuda.
              </p>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-6">
              {faqSections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg shadow-sm">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 text-left bg-gradient-to-r from-[#20313A] to-[#2a3f4d] text-white hover:from-[#1a252e] hover:to-[#243540] transition-all duration-200 rounded-t-lg border-b border-gray-200 flex items-center justify-between"
                  >
                    <h2 className="text-lg font-semibold">{section.title}</h2>
                    {openSections[section.id] ? (
                      <ChevronUp className="h-5 w-5 text-white" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white" />
                    )}
                  </button>

                  {openSections[section.id] && (
                    <div className="px-6 py-4 space-y-4 bg-gradient-to-b from-blue-50 to-white">
                      {section.questions.map((faq, index) => (
                        <div key={index} className="border-b border-blue-100 last:border-b-0 pb-4 last:pb-0">
                          <h3 className="font-medium text-[#20313A] mb-2">{faq.question}</h3>
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[#9EE493] to-[#8dd482] rounded-lg border border-green-200 shadow-sm">
              <h3 className="font-semibold text-[#20313A] mb-3">¿No encontraste lo que buscabas?</h3>
              <p className="text-[#20313A] mb-4 font-medium">
                Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta adicional.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/centro-de-ayuda"
                  className="inline-flex items-center justify-center px-4 py-2 bg-[#20313A] text-white text-sm font-medium rounded-md hover:bg-[#1a252e] transition-colors"
                >
                  Centro de Ayuda
                </Link>
                <Link
                  href="mailto:soporte@easyfit.com.ar"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                >
                  Enviar Email
                </Link>
              </div>
            </div>
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
  );
}
