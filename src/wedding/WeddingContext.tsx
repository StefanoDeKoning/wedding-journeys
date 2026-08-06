import { createContext, useContext, type ReactNode } from "react";
import type { CurrentGuest } from "./useWedding";
import type { PublicWedding } from "./wedding.functions";

export interface ResolvedWeddingState {
  wedding: PublicWedding;
  guest: CurrentGuest | null;
  isAdmin: boolean;
  refresh: () => Promise<void>;
}

const WeddingContext = createContext<ResolvedWeddingState | null>(null);

/**
 * Provided by the `$slug` layout route once access is resolved, so the
 * guest-facing tabs (invitation/story/timeline/...) read the already-loaded
 * wedding instead of independently re-fetching with `useWedding` and
 * flashing blank on every tab switch.
 */
export function WeddingProvider({
  value,
  children,
}: {
  value: ResolvedWeddingState;
  children: ReactNode;
}) {
  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWeddingContext(): ResolvedWeddingState {
  const ctx = useContext(WeddingContext);
  if (!ctx) {
    throw new Error("useWeddingContext must be used within the $slug layout route's <Outlet>");
  }
  return ctx;
}
