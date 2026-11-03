import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeHttpUrl } from "@/lib/safeUrl";
import { Section, SectionHeader } from "@/design-system";
import { useT } from "@/i18n";

export interface WishlistItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  price_text: string | null;
  position: number;
}

/** 1 → "I", 4 → "IV": the couple's own order, numbered like a printed list. */
function toRoman(n: number) {
  const table: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let out = "";
  for (const [value, glyph] of table) {
    while (n >= value) {
      out += glyph;
      n -= value;
    }
  }
  return out;
}

export function WishlistSection({ weddingId }: { weddingId: string }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const t = useT();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("wishlist_items")
        .select("id, title, description, image_url, external_url, price_text, position")
        .eq("wedding_id", weddingId)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (!cancelled) {
        setItems((data ?? []) as WishlistItem[]);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weddingId]);

  if (!loaded || items.length === 0) return null;

  return (
    <Section tone="paper-deep" edge size="spacious" width="wide">
      <div className="grid items-end gap-stack lg:grid-cols-2 lg:gap-block">
        <SectionHeader
          align="left"
          eyebrow={t("a small favor")}
          script={t("our wishlist")}
          title={t("Gift ideas")}
        />
        <p className="type-body-lg max-w-prose text-muted-foreground">
          {t(
            "Your presence is the greatest gift. If you'd still like to spoil us, here are a few ideas.",
          )}
        </p>
      </div>

      <ol className="mt-block grid gap-block sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const href = safeHttpUrl(item.external_url);
          return (
            <li
              key={item.id}
              className="flex flex-col gap-2.5 animate-ds-reveal"
              style={{ animationDelay: `${(i % 6) * 80}ms` }}
            >
              <span
                aria-hidden="true"
                className="font-display text-3xl font-light italic text-gold-ink"
              >
                {toRoman(i + 1)}.
              </span>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="mt-1 mb-2 aspect-[5/4] w-full rounded-t-[999px] rounded-b-card border-gilded object-cover sm:aspect-[4/5]"
                />
              )}
              <h3 className="type-card-title">{item.title}</h3>
              {item.price_text && <p className="type-label !text-gold-ink">{item.price_text}</p>}
              {item.description && (
                <p className="type-body whitespace-pre-line text-muted-foreground">
                  {item.description}
                </p>
              )}
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="type-body link-ink mt-1 self-start focus-ring-elegant"
                >
                  {t("View gift")} <span aria-hidden="true">→</span>
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
