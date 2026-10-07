import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { Accent } from "@/content/services";

type Variant = "terracota" | "salvia" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold transition-colors focus-visible:outline-offset-4";

const variants: Record<Variant, string> = {
  terracota: "bg-terracota text-tinta hover:bg-terracota-deep hover:text-crema",
  salvia: "bg-salvia text-tinta hover:bg-salvia-deep hover:text-crema",
  outline: "border-2 border-tinta/20 text-tinta hover:border-tinta hover:bg-crema-dark",
  ghost: "text-tinta underline-offset-4 hover:underline",
};

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({ variant = "terracota", className = "", ...props }: ButtonLinkProps) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function Button({ variant = "terracota", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}

/** Etiqueta pequeña sobre un título. */
export function Eyebrow({ children, accent = "terracota" }: { children: ReactNode; accent?: Accent }) {
  const color = accent === "terracota" ? "text-terracota-deep" : "text-salvia-deep";
  return (
    <p className={`mb-3 text-sm font-bold uppercase tracking-[0.18em] ${color}`}>{children}</p>
  );
}

export function Section({
  children,
  className = "",
  tone = "crema",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "crema" | "crema-dark" | "terracota-soft" | "salvia-soft";
  id?: string;
}) {
  const tones = {
    crema: "bg-crema",
    "crema-dark": "bg-crema-dark",
    "terracota-soft": "bg-terracota-soft",
    "salvia-soft": "bg-salvia-soft",
  };
  return (
    <section id={id} className={`${tones[tone]} py-16 sm:py-20 ${className}`}>
      <div className="container-site">{children}</div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  accent = "terracota",
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  accent?: Accent;
  children?: ReactNode;
}) {
  return (
    <header className="container-site pt-14 pb-10 sm:pt-20 sm:pb-14">
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow accent={accent}>{eyebrow}</Eyebrow>}
        <h1 className="text-4xl sm:text-5xl">{title}</h1>
        {lead && <p className="mt-5 text-xl text-tinta-soft">{lead}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </header>
  );
}

export function Card({
  children,
  className = "",
  accent,
}: {
  children: ReactNode;
  className?: string;
  accent?: Accent;
}) {
  const border =
    accent === "terracota"
      ? "border-terracota/40"
      : accent === "salvia"
        ? "border-salvia/50"
        : "border-linea";
  return (
    <div className={`rounded-card border bg-white/70 p-6 sm:p-8 ${border} ${className}`}>
      {children}
    </div>
  );
}

export function CheckList({ items, accent = "terracota" }: { items: string[]; accent?: Accent }) {
  const dot = accent === "terracota" ? "bg-terracota" : "bg-salvia";
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className={`mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
