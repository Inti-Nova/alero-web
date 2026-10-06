import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const instructor = await prisma.instructor.upsert({
    where: { email: "instructora@alero.local" },
    update: {},
    create: {
      name: "Instructora Alero",
      email: "instructora@alero.local",
      timezone: "America/Bogota",
      availability: {
        create: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday,
          startMinute: 9 * 60,
          endMinute: 17 * 60,
        })),
      },
    },
  });

  await prisma.service.upsert({
    where: { slug: "asesoria-individual" },
    update: {},
    create: {
      slug: "asesoria-individual",
      name: "Asesoría individual",
      description: "Sesión uno a uno para diseñar tu clase o asesoría.",
      durationMinutes: 60,
      priceCents: 0,
      instructorId: instructor.id,
    },
  });

  console.log("Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
