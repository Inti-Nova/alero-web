import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/cta-band";
import { Eyebrow, Section } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { coverOf, coverSize, getPublishedPost, topicLabel } from "@/modules/posts";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Recurso no encontrado" };
  const cover = coverOf(post);
  const img = cover ? coverSize(cover, "card") : null;
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: img ? { images: [{ url: img.url, width: img.width, height: img.height }] } : undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const cover = coverOf(post);
  const img = cover ? coverSize(cover, "hero") : null;
  const accent = post.topic === "clases-de-ingles" ? "salvia" : "terracota";

  return (
    <>
      <article>
        <header className="container-site pt-14 pb-8 sm:pt-20">
          <div className="max-w-3xl">
            <Eyebrow accent={accent}>{topicLabel[post.topic]}</Eyebrow>
            <h1 className="text-4xl sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-xl text-tinta-soft">{post.excerpt}</p>
            {post.publishedAt && (
              <p className="mt-4 text-sm text-tinta-soft">{formatDate(post.publishedAt.slice(0, 10))}</p>
            )}
          </div>
        </header>

        {img && (
          <div className="container-site pb-10">
            <Image
              src={img.url}
              alt={cover?.alt ?? ""}
              width={img.width}
              height={img.height}
              priority
              className="max-h-[520px] w-full rounded-card object-cover"
            />
          </div>
        )}

        <Section tone="crema-dark">
          <div className="rich-text max-w-3xl">
            <RichText data={post.content as unknown as SerializedEditorState} />
          </div>
          {post.instagramUrl && (
            <p className="mt-10 max-w-3xl">
              <a
                href={post.instagramUrl}
                target="_blank"
                rel="noopener"
                className="font-bold text-terracota-deep underline-offset-4 hover:underline"
              >
                Ver el carrusel original en Instagram →
              </a>
            </p>
          )}
          <p className="mt-10">
            <Link href="/recursos" className="font-semibold underline-offset-4 hover:underline">
              ← Volver a recursos
            </Link>
          </p>
        </Section>
      </article>

      <CtaBand />
    </>
  );
}
