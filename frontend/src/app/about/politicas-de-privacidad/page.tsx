'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const router = useRouter();

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
              <h1 className="text-xl font-bold text-[#20313A]">Políticas de Privacidad</h1>
              <p className="text-sm text-gray-600">Última actualización: Septiembre 2025</p>
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
                En EasyFit valoramos su privacidad y estamos comprometidos a proteger sus datos personales. Esta
                Política de Privacidad describe cómo recopilamos, utilizamos, compartimos y protegemos su información
                cuando utiliza nuestros servicios.
              </p>
            </div>

            {/* Sections - These will need to be filled with actual content from the .docx file */}
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">
                  1. Responsable del Tratamiento y Datos de Contacto
                </h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit Marketplace S.R.L., con domicilio legal calle Ruta 33 KM 8.5, Calle 6 número 6, Bosque Alto,
                    de la ciudad de Bahía Blanca, partido de Bahía Blanca, provincia de Buenos Aires (CPA 8000) y CUIT
                    30719123496, es responsable de la base de datos en la que se almacenarán los datos personales.
                  </p>
                  <p>
                    Para ejercer sus derechos de acceso, rectificación, actualización o supresión de datos podrá
                    comunicarse al correo electrónico legal@easyfit.com.ar o enviar una nota al domicilio indicado.
                  </p>
                  <p>
                    La Agencia de Acceso a la Información Pública (AAIP) es la autoridad de aplicación de la Ley 25.326;
                    cualquier reclamo no resuelto podrá ser presentado ante dicho organismo.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">2. Datos Personales que Recopilamos</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit recolecta y trata distintos tipos de datos personales según la categoría correspondiente:
                  </p>
                  <h3 className="font-medium text-[#20313A]">Datos de Registro</h3>
                  <p>
                    Incluyen nombre y apellido, domicilio, correo electrónico, número de teléfono, documento nacional de
                    identidad, fecha de nacimiento y claves de acceso. Su objetivo principal es crear y administrar la
                    cuenta del usuario y verificar su identidad.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Datos de Riders</h3>
                  <p>
                    Se recopila la fotografía facial para validación biométrica, datos del vehículo, seguro vigente,
                    antecedentes y licencia de conducir. Estos datos se utilizan para comprobar la aptitud para prestar
                    el servicio de cadetería.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Datos de Transacción</h3>
                  <p>
                    Comprenden información sobre los pedidos realizados, artículos seleccionados, horarios, dirección de
                    entrega, medios de pago e importes. Estos datos permiten procesar pedidos y pagos, coordinar las
                    entregas y llevar adelante la facturación.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Datos de Geolocalización y Uso</h3>
                  <p>
                    Tales como dirección IP, identificadores del dispositivo, registros de acceso, datos GPS del Rider,
                    logs de actividad, chats, fotos de entrega y cookies. Su uso principal es coordinar la logística en
                    tiempo real y reforzar la seguridad.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">3. Finalidades del Tratamiento</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit procesa sus datos personales únicamente para las finalidades específicas, explícitas y
                    legítimas que se describen a continuación:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Gestión de registros y cuentas:</strong> validar la identidad del Usuario, Rider o
                      Comercio, crear y mantener la cuenta, recuperar contraseñas y brindar soporte técnico.
                    </li>
                    <li>
                      <strong>Ejecución de contratos:</strong> facilitar la compra de prendas y la prestación de
                      servicios de entrega, transmitir los datos necesarios a Comercios y Riders, facturar, cobrar y
                      liquidar pagos.
                    </li>
                    <li>
                      <strong>Comunicación con los usuarios:</strong> enviar confirmaciones de pedido, estados de envío,
                      recordatorios, cambios en las condiciones y notificaciones de seguridad.
                    </li>
                    <li>
                      <strong>Seguridad y prevención del fraude:</strong> verificar identidad y datos de vehículos;
                      realizar validaciones biométricas; detectar actividades ilegales o contrarias a nuestras
                      políticas.
                    </li>
                    <li>
                      <strong>Marketing y publicidad:</strong> ofrecer promociones, descuentos y comunicaciones
                      comerciales, siempre que el usuario haya prestado su consentimiento.
                    </li>
                    <li>
                      <strong>Cumplimiento de obligaciones legales:</strong> atender requerimientos de autoridades
                      judiciales o administrativas, responder a reclamos de consumidores.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">
                  4. Base Legal para el Tratamiento de Datos
                </h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>El tratamiento de datos personales se fundamenta en una o más de las siguientes bases legales:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Consentimiento:</strong> la recolección y tratamiento de datos se realizará con el
                      consentimiento previo, expreso e informado del titular. El Usuario podrá revocar su consentimiento
                      en cualquier momento.
                    </li>
                    <li>
                      <strong>Ejecución de un contrato:</strong> es necesario tratar datos para cumplir con las
                      obligaciones surgidas de los Términos y Condiciones y para proporcionar los servicios solicitados.
                    </li>
                    <li>
                      <strong>Cumplimiento de obligaciones legales:</strong> EasyFit tratará datos para cumplir con las
                      disposiciones aplicables en materia tributaria, de defensa del consumidor y seguridad.
                    </li>
                    <li>
                      <strong>Interés legítimo:</strong> podemos usar datos para mejorar la plataforma, garantizar la
                      seguridad, prevenir el fraude y realizar estadísticas, siempre que no vulneren los derechos
                      fundamentales.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">5. Compartición y Transferencia de Datos</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit sólo comparte datos personales con terceros cuando ello resulte necesario para cumplir con
                    las finalidades indicadas y bajo acuerdos de confidencialidad:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Comercios Aliados:</strong> recibirán los datos estrictamente necesarios para preparar y
                      facturar los pedidos. Los Comercios se obligan a no utilizar la información para finalidades de
                      marketing ajenas al pedido.
                    </li>
                    <li>
                      <strong>Riders:</strong> obtendrán la dirección de entrega y datos de contacto del Usuario para
                      realizar la entrega. El Rider no podrá conservar ni utilizar dichos datos para otros fines.
                    </li>
                    <li>
                      <strong>Proveedores de servicios:</strong> proveedores de pago, operadores de tarjetas,
                      plataformas de verificación de identidad, servicios de mensajería y análisis de datos.
                    </li>
                    <li>
                      <strong>Autoridades y organismos públicos:</strong> podremos revelar datos cuando una ley, orden
                      judicial o autoridad competente lo exija.
                    </li>
                  </ul>
                  <p>
                    <strong>Transferencias internacionales:</strong> EasyFit puede almacenar o procesar datos en
                    servidores ubicados fuera de Argentina, garantizando un nivel de protección adecuado conforme a la
                    Ley 25.326.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">
                  6. Seguridad y Confidencialidad de la Información
                </h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit adopta medidas técnicas, organizativas y administrativas para proteger los datos personales
                    contra accesos no autorizados, adulteración, pérdida o destrucción, en línea con el principio de
                    seguridad.
                  </p>
                  <p>
                    Implementamos protocolos de cifrado, autenticación, firewalls, controles de acceso y políticas
                    internas de gestión de contraseñas. Nuestro personal y los proveedores que intervienen en el
                    tratamiento se comprometen a mantener la información en estricta confidencialidad.
                  </p>
                  <p>
                    Se incorpora la privacidad desde el diseño y se evalúa la protección de datos en cada desarrollo de
                    producto, asegurando que sean exactos y completos y que se eliminen cuando dejen de ser necesarios.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">7. Derechos de los Titulares de Datos</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    En cualquier momento, el Usuario puede ejercer los derechos previstos en la Ley 25.326 y en esta
                    política:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>
                      <strong>Derecho de acceso:</strong> consultar qué datos personales suyos almacena EasyFit y para
                      qué se utilizan.
                    </li>
                    <li>
                      <strong>Derecho de rectificación y actualización:</strong> solicitar la corrección de datos
                      inexactos o incompletos.
                    </li>
                    <li>
                      <strong>Derecho de supresión (cancelación):</strong> pedir la eliminación de sus datos cuando
                      hayan dejado de ser necesarios o cuando retire su consentimiento.
                    </li>
                    <li>
                      <strong>Derecho de oposición:</strong> oponerse al tratamiento de sus datos para determinadas
                      finalidades, como la recepción de comunicaciones comerciales.
                    </li>
                    <li>
                      <strong>Derecho a revocar el consentimiento:</strong> el Usuario podrá retirar su consentimiento
                      en cualquier momento.
                    </li>
                    <li>
                      <strong>Derecho a la portabilidad de datos:</strong> solicitar que sus datos le sean entregados en
                      un formato estructurado y de uso común.
                    </li>
                  </ul>
                  <p>
                    Para ejercer estos derechos, envíe un correo a legal@easyfit.com.ar o una nota al domicilio de
                    EasyFit detallando su petición y aportando prueba de identidad. EasyFit responderá las solicitudes
                    de acceso en un plazo máximo de diez (10) días hábiles.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">8. Retención y Conservación de Datos</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    Conservaremos los datos personales mientras dure la relación contractual y por el tiempo necesario
                    para cumplir con las obligaciones legales y fiscales. Posteriormente, los datos serán eliminados o
                    anonimizados, salvo que el titular solicite su conservación para la defensa de un derecho.
                  </p>
                  <p>
                    Los registros contables y de transacciones se conservarán conforme a los plazos exigidos por la
                    normativa vigente.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">9. Cookies y Tecnologías de Seguimiento</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit utiliza cookies, etiquetas de píxel y tecnologías similares para que la plataforma funcione
                    correctamente, recordar sus preferencias, mantener la seguridad y presentar publicidad relevante.
                  </p>
                  <p>
                    Puede configurar su navegador para rechazar cookies; sin embargo, algunas funcionalidades podrían no
                    estar disponibles. Se le informará cuando se utilicen cookies para fines publicitarios y podrá
                    manifestar su oposición.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">10. Menores de Edad</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    La aplicación está destinada exclusivamente a personas mayores de 18 años con capacidad legal para
                    contratar. No recabamos intencionalmente datos de menores de edad.
                  </p>
                  <p>
                    Si un menor proporciona datos personales sin el consentimiento de sus padres o tutores, eliminaremos
                    dichos datos al tomar conocimiento de esta circunstancia.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">11. Modificaciones de la Política</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit podrá modificar esta Política de Privacidad para reflejar cambios en la legislación o en
                    nuestros servicios. Las modificaciones serán publicadas en la aplicación y entrarán en vigencia a
                    los diez (10) días de su publicación, salvo que se indique un plazo diferente.
                  </p>
                  <p>
                    El uso continuado de la aplicación después de la entrada en vigencia de las modificaciones implicará
                    la aceptación de la nueva versión. En caso de desacuerdo, el usuario deberá comunicar su rechazo y
                    cerrar su cuenta dentro del plazo indicado.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">12. Contacto</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, puede
                    contactarnos en:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Email: legal@easyfit.com.ar</li>
                    <li>Teléfono: +54 9 291 4436-642</li>
                    <li>Dirección: Ruta 33 KM 8.5, Calle 6 número 6, Bosque Alto, Bahía Blanca, Buenos Aires (8000)</li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
