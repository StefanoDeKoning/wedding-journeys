import { useEffect, useState } from "react";
import { Gift, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeHttpUrl } from "@/lib/safeUrl";
import { Section, SectionHeader, WishCard, ThemedButton } from "@/design-system";

export interface WishlistItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  external_url: string | null;
  price_text: string | null;
  position: number;
}

export function WishlistSection({ weddingId }: { weddingId: string }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

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
    <Section size="regular" width="wide">
      <SectionHeader
        eyebrow="a small favor"
        script="our wishlist"
        title="Gift ideas, if you're inclined"
        description="Your presence is the greatest gift. If you'd still like to spoil us, here are a few ideas."
      />

      <div className="mt-block grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <WishCard
            key={item.id}
            title={item.title}
            price={item.price_text}
            image={item.image_url ?? undefined}
            imageAlt={item.title}
            className="animate-ds-reveal"
            action={
              safeHttpUrl(item.external_url) && (
                <ThemedButton asChild variant="gilded" size="sm">
                  <a href={safeHttpUrl(item.external_url)!} target="_blank" rel="noreferrer noopener">
                    <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                    View gift
                  </a>
                </ThemedButton>
              )
            }
            style={{ animationDelay: `${(i % 6) * 80}ms` }}
          >
            {item.description && <p className="whitespace-pre-line">{item.description}</p>}
            {!item.image_url && (
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Gift aria-hidden="true" className="w-5 h-5" />
              </span>
            )}
          </WishCard>
        ))}
      </div>
    </Section>
  );
}
