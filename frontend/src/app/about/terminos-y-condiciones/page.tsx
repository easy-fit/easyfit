'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
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
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[#20313A] hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-bold text-[#20313A]">Términos y Condiciones</h1>
              <p className="text-sm text-gray-600">Última actualización: Septiembre 5</p>
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
                Bienvenido a EasyFit. Al utilizar nuestros servicios, usted acepta estar sujeto a los siguientes
                términos y condiciones. Por favor, lea cuidadosamente estos términos antes de utilizar nuestra
                plataforma.
              </p>
            </div>

            {/* Sections - These will need to be filled with actual content from the .docx file */}
            <div className="space-y-8">
              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">
                  Cláusula Preliminar: Disposiciones Generales y Definiciones
                </h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit Marketplace S.R.L. (en adelante, &quot;EasyFit&quot; o la &quot;Aplicación&quot;) con CUIT
                    30719123496 y Domicilio calle Ruta 33 KM 8.5, Calle 6 número 6, Bosque Alto, de la ciudad de Bahía
                    Blanca, partido de Bahía Blanca, provincia de Buenos Aires (CPA 8000), en cumplimiento de la Ley N.º
                    24.240 de Defensa del Consumidor y el Código Civil y Comercial de la Nación, establece los presentes
                    Términos y Condiciones Generales, de carácter obligatorio y vinculante.
                  </p>
                  <p>
                    Su finalidad es garantizar un marco transparente que regule los derechos y obligaciones de quienes
                    utilicen la plataforma, incluyendo a los Usuarios, a los Comercios Aliados y a los Riders, en todo
                    lo relativo al acceso, uso y operatoria de la Aplicación.
                  </p>
                  <p>
                    Toda persona que no acepte estos Términos y Condiciones Generales no podrá utilizar la Aplicación.
                    El acceso y uso de la misma implica la lectura, comprensión y aceptación plena de este instrumento
                    como requisito esencial y previo para formar parte de la operatoria.
                  </p>
                  <h3 className="font-medium text-[#20313A] mt-4">Definiciones</h3>
                  <p>
                    <strong>Usuario:</strong> Toda persona humana mayor de 18 años con capacidad legal para contratar, o
                    persona jurídica debidamente constituida, que acceda y utilice la Aplicación para adquirir productos
                    o servicios.
                  </p>
                  <p>
                    <strong>EasyFit / la Aplicación:</strong> Plataforma tecnológica que facilita el encuentro entre
                    Usuarios, Comercios Aliados y Riders, brindando el soporte digital necesario para que las partes
                    puedan interactuar.
                  </p>
                  <p>
                    <strong>Comercio Aliado:</strong> Todo local, tienda o empresa que ofrece sus productos a través de
                    la Aplicación, siendo el único responsable por la existencia, calidad, legalidad, precio,
                    facturación y disponibilidad de los mismos.
                  </p>
                  <p>
                    <strong>Rider / Repartidor:</strong> Prestador independiente que, actuando como contratista
                    autónomo, se encarga de realizar los servicios de entrega a solicitud de los Usuarios a través de la
                    Aplicación.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">1. Inscripción y Registro</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <h3 className="font-medium text-[#20313A]">Acceso a la Aplicación</h3>
                  <p>
                    El uso de la Plataforma es libre de cargo, quedando a exclusivo costo del Usuario los gastos
                    derivados de la conexión a internet o servicios de telecomunicaciones. El ingreso únicamente podrá
                    realizarse a través de los mecanismos autorizados por EasyFit.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Condiciones para ser Usuario</h3>
                  <p>
                    Podrán registrarse como Usuarios las personas mayores de 18 años con plena capacidad jurídica para
                    contratar, así como las personas jurídicas constituidas conforme a la normativa vigente, siempre que
                    completen el procedimiento de inscripción y acepten estos Términos y Condiciones junto con la
                    Política de Privacidad.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Registro y Datos Personales</h3>
                  <p>
                    Para darse de alta, el Usuario deberá completar el formulario de inscripción proporcionando
                    información cierta, completa y actualizada, incluyendo las verificaciones de identidad que EasyFit
                    requiera. El Usuario se obliga a mantener dicha información vigente y será responsable en todo
                    momento por su exactitud y autenticidad.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">2. Uso de la Plataforma</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <h3 className="font-medium text-[#20313A]">Exhibición de Productos</h3>
                  <p>
                    A través de la Plataforma, los Usuarios podrán acceder a la oferta de prendas publicada por los
                    Comercios Aliados, seleccionar artículos y cursar pedidos, cuya entrega se coordinará mediante
                    Riders disponibles. EasyFit no actúa como vendedor de los productos, sino como intermediario
                    tecnológico.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Confirmación de Pedido</h3>
                  <p>
                    Ingresado el pedido, la Plataforma emitirá al Usuario la confirmación del servicio de cadetería, en
                    la que constarán las condiciones de entrega, dirección y datos de contacto. El Usuario será
                    responsable exclusivo de la veracidad y exactitud de los datos informados.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Modalidad de Operación</h3>
                  <p>
                    Los Riders podrán decidir libremente cuándo encontrarse disponibles. Si no aceptan o responden un
                    pedido dentro de los treinta (30) segundos, este será reasignado automáticamente. Al momento de la
                    entrega, el Usuario deberá proporcionar el código de seguridad de cuatro (4) dígitos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">3. Condiciones de Pago y Facturación</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <h3 className="font-medium text-[#20313A]">Precios de los Productos</h3>
                  <p>
                    Los valores de las prendas ofrecidas por los Comercios Aliados serán los informados en la
                    Plataforma, incluyendo los impuestos y recargos que correspondan. EasyFit no interviene en la
                    fijación ni en el control de dichos precios.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Medios de Pago</h3>
                  <p>
                    Para abonar los productos y el servicio de cadetería, los Usuarios deberán ingresar en la Plataforma
                    la información de sus medios de pago habilitados (tarjetas de débito, crédito u otros mecanismos
                    electrónicos). El Usuario garantiza la veracidad de los datos ingresados.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Tarifas de Envío</h3>
                  <p>
                    El costo del servicio de cadetería será informado al momento de la solicitud en la Plataforma. Dicho
                    importe podrá variar en función de la distancia, el horario, la disponibilidad de Riders u otros
                    factores logísticos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">4. Uso de la Aplicación</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <h3 className="font-medium text-[#20313A]">Compromiso del Usuario</h3>
                  <p>Al acceder a la Aplicación, el Usuario se obliga a:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Utilizar la Cuenta exclusivamente para fines personales</li>
                    <li>No emplear la Aplicación para fines ilícitos o fraudulentos</li>
                    <li>Custodiar y mantener en confidencialidad su contraseña</li>
                    <li>No acceder, copiar o manipular datos sin autorización</li>
                    <li>Abstenerse de introducir virus o malware</li>
                  </ul>
                  <h3 className="font-medium text-[#20313A]">Consecuencias por Incumplimiento</h3>
                  <p>
                    El incumplimiento de estas obligaciones facultará a EasyFit a suspender de manera inmediata la
                    Cuenta o darla de baja definitiva, sin derecho a reclamo o indemnización alguna.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">5. Cancelaciones y Penalidades</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <h3 className="font-medium text-[#20313A]">Cancelación sin Penalidad</h3>
                  <p>
                    El Usuario podrá cancelar la orden sin costo siempre que lo haga antes de que el Rider acepte el
                    servicio y/o antes de que el Comercio Aliado haya comenzado a preparar el pedido.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Cancelación con Penalidad</h3>
                  <p>
                    Si la cancelación se produce una vez aceptado el servicio por el Rider y/o iniciada la preparación
                    del pedido, EasyFit podrá cobrar hasta el cien por ciento (100%) del valor del servicio de
                    cadetería.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Derecho de Revocación</h3>
                  <p>
                    Conforme el artículo 34 de la Ley 24.240, el Usuario podrá revocar la compra dentro de los diez (10)
                    días corridos desde la recepción de los productos. Los gastos de devolución serán asumidos por el
                    Usuario.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">6. Promociones</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit podrá implementar de manera periódica promociones, beneficios y programas especiales
                    destinados a Usuarios y Riders, que podrán incluir descuentos, bonificaciones, cupones, planes de
                    fidelización u otras ventajas comerciales.
                  </p>
                  <p>
                    Cada acción promocional especificará sus condiciones particulares: vigencia, alcance territorial,
                    productos o servicios incluidos, limitaciones de uso y cualquier restricción adicional.
                  </p>
                  <p>
                    EasyFit podrá modificar, suspender o cancelar, total o parcialmente, cualquier promoción en
                    cualquier momento. El uso indebido de una promoción habilitará a EasyFit a rechazar la transacción y
                    suspender la Cuenta del Usuario infractor.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">7. Responsabilidad</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <h3 className="font-medium text-[#20313A]">Uso y Riesgo del Usuario</h3>
                  <p>
                    El Usuario declara que utiliza la Plataforma bajo su exclusiva responsabilidad, comprometiéndose a
                    actuar con prudencia y sentido común en la interacción con Comercios Aliados y Riders.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Relación con Comercios Aliados</h3>
                  <p>
                    EasyFit no interviene en la compraventa de prendas, siendo dicha relación exclusiva entre el Usuario
                    y el Comercio Aliado. EasyFit no garantiza ni asume responsabilidad respecto de la existencia,
                    legalidad, calidad, estado o disponibilidad de los productos publicados.
                  </p>
                  <h3 className="font-medium text-[#20313A]">Limitación de Responsabilidad</h3>
                  <p>
                    EasyFit no asumirá responsabilidad alguna por productos defectuosos, demoras, robos, pérdidas o
                    incidentes durante el traslado, errores en precios o cualquier daño indirecto.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">8. Derechos de Propiedad Intelectual</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    El Usuario reconoce que todos los derechos de propiedad intelectual e industrial sobre los elementos
                    incorporados en la Plataforma —incluyendo marcas, logotipos, nombres comerciales, textos, imágenes,
                    diseños, software y cualquier otro contenido— pertenecen exclusivamente a EasyFit o a sus legítimos
                    titulares.
                  </p>
                  <p>
                    EasyFit concede al Usuario una licencia personal, intransferible, no exclusiva y revocable para
                    utilizar, visualizar, descargar e imprimir los contenidos de la Plataforma, únicamente con fines
                    personales y no comerciales.
                  </p>
                  <p>
                    EasyFit no asume responsabilidad alguna por la autenticidad, legalidad o procedencia de los
                    productos ofrecidos por los Comercios Aliados que pudieran violar derechos de propiedad intelectual
                    de terceros.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">
                  9. Modificaciones de los Términos y Condiciones
                </h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    EasyFit podrá modificar en cualquier momento los presentes Términos y Condiciones, publicando en la
                    Plataforma la versión actualizada. Salvo que se indique lo contrario, los cambios entrarán en
                    vigencia a los diez (10) días corridos de su publicación.
                  </p>
                  <p>
                    La utilización de la Plataforma después de la entrada en vigor de las modificaciones implicará la
                    aceptación plena y sin reservas de las nuevas condiciones.
                  </p>
                  <p>
                    En caso de disconformidad con los cambios introducidos, el Usuario deberá manifestar su rechazo
                    enviando un correo electrónico dentro de los diez (10) días corridos posteriores a la publicación.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">10. Ley Aplicable y Jurisdicción</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    Estos Términos y Condiciones, así como la relación jurídica entre EasyFit y los Usuarios, se regirán
                    e interpretarán de conformidad con las leyes vigentes en la República Argentina.
                  </p>
                  <p>
                    Toda controversia relacionada con la utilización de la Plataforma será sometida a los tribunales
                    ordinarios con asiento en la Ciudad Autónoma de Buenos Aires. Sin perjuicio de ello, el Usuario
                    podrá iniciar acciones judiciales en los tribunales correspondientes a su domicilio real.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-[#20313A] mb-4">11. Contacto</h2>
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos en:</p>
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
