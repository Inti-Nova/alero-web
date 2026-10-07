import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand } from "@/components/cta-band";
import { ButtonLink, Card, Eyebrow, PageHeader, Section } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { coverOf, coverSize, listPublishedPosts, topicLabel } from "@/modules/posts";
import { getContactLinks } from "@/modules/settings";

export const metadata: Metadata = {
  title: "Recursos para familias",
  description:
    "Guías y artículos cortos sobre adaptación escolar, bilingüismo temprano e inglés para niños.",
};

export const revalidate = 3600;

export default async function RecursosPage() {
  const [posts, { instagramUrl }] = await Promise.all([listPublishedPosts(), getContactLinks()]);

  return (
    <>
      <PageHeader
        eyebrow="Recursos"
        title="Ideas cortas para aplicar en casa"
        lead="Lo que voy compartiendo sobre adaptación escolar, bilingüismo temprano e inglés para niños, ampliado y ordenado para que lo encuentres cuando lo necesites."
      />

      <Section tone="crema-dark">
        {posts.length === 0 ? (
          <Card className="max-w-2xl">
            <h2 className="text-2xl">Estoy ordenando el contenido</h2>
            <p className="mt-3 text-tinta-soft">
              Muy pronto encontrarás aquí las guías que he publicado en Instagram, ampliadas.
              Mientras tanto puedes verlas allá.
            </p>
            {instagramUrl && (
              <ButtonLink href={instagramUrl} variant="outline" className="mt-6" target="_blank" rel="noopener">
                Ver en Instagram
              </ButtonLink>
            )}
          </Card>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const cover = coverOf(post);
              const img = cover ? coverSize(cover, "card") : null;
              const accent = post.topic === "clases-de-ingles" ? "salvia" : "terracota";
              return (
                <li key={post.id}>
                  <Card className="flex h-full flex-col overflow-hidden p-0! sm:p-0!">
                    {img && (
                      <Image
                        src={img.url}
                        alt={cover?.alt ?? ""}
                        width={img.width}
                        height={img.height}
                        className="aspect-[3/2] w-full object-cover"
                      />
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      <Eyebrow accent={accent}>{topicLabel[post.topic]}</Eyebrow>
                      <h2 className="text-xl">
                        <Link href={`/recursos/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="mt-2 flex-1 text-tinta-soft">{post.excerpt}</p>
                      {post.publishedAt && (
                        <p className="mt-4 text-sm text-tinta-soft">{formatDate(post.publishedAt.slice(0, 10))}</p>
                      )}
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <CtaBand
        title="¿Tienes una pregunta que no está aquí?"
        text="Escríbeme. Las preguntas de las familias son las que terminan convertidas en recursos."
      />
    </>
  );
}
