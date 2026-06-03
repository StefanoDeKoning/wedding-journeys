import { useEffect, useState } from "react";
import { Gift, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <div className="divider-script">
        <span className="font-script text-2xl">our wishlist</span>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground max-w-xl mx-auto">
        Your presence is the greatest gift. If you'd still like to spoil us, here are a few ideas.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden flex flex-col"
          >
            {item.image_url ? (
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="aspect-[4/3] w-full flex items-center justify-center bg-gradient-sunset/40">
                <Gift className="w-10 h-10 text-primary" />
              </div>
            )}
            <div className="p-5 flex flex-col gap-2 flex-1">
              <h3 className="font-display text-xl leading-tight">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {item.description}
                </p>
              )}
              {item.price_text && (
                <p className="text-sm font-medium text-primary">{item.price_text}</p>
              )}
              {item.external_url && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="mt-auto self-start rounded-full"
                >
                  <a href={item.external_url} target="_blank" rel="noreferrer noopener">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View gift
                  </a>
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
