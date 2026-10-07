import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { getContactLinks } from "@/modules/settings";

export const metadata: Metadata = {
  title: "Política de privacidad y tratamiento de datos",
  description:
    "Cómo se recogen, usan y protegen los datos personales de las familias y de los menores de edad en este sitio.",
};

/** Fecha de la última revisión del texto. Actualizar cuando cambie la política. */
const lastUpdated = "6 de octubre de 2026";

export const revalidate = 3600;

export default async function PrivacidadPage() {
  const { name, ownerName } = siteConfig;
  const { email } = await getContactLinks();
  const contactLine = email ? `al correo ${email}` : "a través del formulario de contacto de este sitio";

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Política de privacidad y tratamiento de datos personales"
        lead={`Esta política explica qué datos recoge ${name}, para qué los usa y qué derechos tienes sobre ellos, con especial cuidado en los datos de niños y niñas.`}
      />

      <Section tone="crema-dark">
        <article className="max-w-3xl space-y-8">
          <p className="text-sm text-tinta-soft">Última actualización: {lastUpdated}</p>

          <section className="space-y-3">
            <h2 className="text-2xl">1. Quién es responsable del tratamiento</h2>
            <p>
              La responsable del tratamiento de los datos personales recogidos en este sitio es{" "}
              {ownerName}, quien presta los servicios bajo la marca {name}. Puedes escribirle{" "}
              {contactLine} para cualquier asunto relacionado con tus datos.
            </p>
            <p>
              El tratamiento se hace conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y las
              demás normas colombianas sobre protección de datos personales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">2. Qué datos recogemos</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Del adulto que contacta o agenda:</strong> nombre, correo electrónico,
                número de teléfono o WhatsApp y el contenido del mensaje que nos envías.
              </li>
              <li>
                <strong>Del niño o niña, solo si el adulto decide compartirlos:</strong> edad,
                nombre de pila y la descripción de la situación por la que se consulta. Nunca
                pedimos documentos de identidad de menores.
              </li>
              <li>
                <strong>Datos de reserva:</strong> al agendar en este sitio guardamos tu nombre,
                correo, teléfono si lo indicas, la fecha y hora elegidas, tu zona horaria y el
                momento en que aceptaste este consentimiento.
              </li>
              <li>
                <strong>Datos de pago:</strong> los procesan directamente la pasarela (Wompi o
                Bold) o tu entidad financiera. No almacenamos números de tarjeta ni de cuenta.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">3. Datos de niños y niñas</h2>
            <p>
              Los servicios están dirigidos a padres, madres y adultos responsables. Solo tratamos
              datos de menores de edad cuando el adulto responsable los entrega de forma voluntaria
              y con su consentimiento expreso, y únicamente en la medida en que sean necesarios para
              prestar el acompañamiento o la clase. En todo caso el tratamiento respeta el interés
              superior del niño o la niña y sus derechos fundamentales.
            </p>
            <p>
              Todo formulario de este sitio que pueda recibir datos de un menor incluye una casilla
              de consentimiento que el adulto debe marcar. Puedes retirar ese consentimiento en
              cualquier momento escribiéndonos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">4. Para qué usamos los datos</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Responder tus mensajes y coordinar sesiones o clases.</li>
              <li>Preparar y prestar el servicio contratado.</li>
              <li>Enviarte confirmaciones, recordatorios y material relacionado con tu sesión.</li>
              <li>Emitir comprobantes de pago cuando corresponda.</li>
            </ul>
            <p>
              No vendemos ni cedemos tus datos a terceros con fines comerciales, y no enviamos
              publicidad sin tu autorización previa.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">5. Con quién se comparten</h2>
            <p>
              Usamos proveedores que tratan datos por nuestra cuenta y bajo sus propias políticas de
              privacidad: el proveedor de alojamiento y base de datos del sitio, el servicio de
              envío de correos, Google o una plataforma similar para las videollamadas, WhatsApp
              para la mensajería, y Wompi o Bold para los pagos.
              Algunos de ellos pueden almacenar la información fuera de Colombia, con garantías de
              protección adecuadas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">6. Cuánto tiempo los conservamos</h2>
            <p>
              Conservamos los datos mientras dure la relación con la familia y, después, durante el
              tiempo necesario para atender obligaciones legales o contables. Las notas de las
              sesiones se eliminan cuando dejan de ser necesarias para el acompañamiento o cuando lo
              solicitas.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">7. Tus derechos</h2>
            <p>Como titular de los datos, y como representante de tu hijo o hija, puedes:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Conocer, actualizar y rectificar tus datos y los del menor.</li>
              <li>Solicitar prueba de la autorización otorgada.</li>
              <li>Ser informado sobre el uso que se les ha dado.</li>
              <li>Revocar la autorización o solicitar la supresión de los datos.</li>
              <li>Presentar quejas ante la Superintendencia de Industria y Comercio.</li>
            </ul>
            <p>
              Para ejercerlos, escríbenos {contactLine}. Respondemos en los plazos que fija la ley.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">8. Seguridad</h2>
            <p>
              Aplicamos medidas razonables para proteger la información: acceso restringido a la
              responsable, cuentas con verificación en dos pasos y proveedores con cifrado en
              tránsito. Ningún sistema es infalible, pero si ocurriera un incidente que afecte tus
              datos te lo informaremos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl">9. Cambios en esta política</h2>
            <p>
              Si esta política cambia, publicaremos la versión actualizada en esta misma página con
              la nueva fecha de revisión.
            </p>
          </section>

          <p className="text-sm text-tinta-soft">
            Este texto es una base redactada para el lanzamiento y debe ser revisado por un
            profesional en protección de datos antes de considerarse definitivo.
          </p>
        </article>
      </Section>
    </>
  );
}
