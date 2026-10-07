import config from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";
import type { Media, Post } from "@/payload-types";

export const topicLabel: Record<Post["topic"], string> = {
  "adaptacion-escolar": "Adaptación escolar",
  "bilinguismo-temprano": "Bilingüismo temprano",
  "clases-de-ingles": "Inglés para niños",
};

export const listPublishedPosts = cache(async () => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 100,
    depth: 1,
  });
  return result.docs;
});

export const getPublishedPost = cache(async (slug: string) => {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "posts",
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] ?? null;
});

/** Devuelve la imagen de portada poblada, o null si no hay. */
export function coverOf(post: Post): Media | null {
  return post.cover && typeof post.cover === "object" ? post.cover : null;
}

export function coverSize(media: Media, size: "thumbnail" | "card" | "hero") {
  const s = media.sizes?.[size];
  if (s?.url && s.width && s.height) return { url: s.url, width: s.width, height: s.height };
  if (media.url && media.width && media.height) {
    return { url: media.url, width: media.width, height: media.height };
  }
  return null;
}
