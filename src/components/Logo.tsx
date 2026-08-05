import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 32 : size === "lg" ? 56 : 40;
  return (
    <Link to="/" className="inline-flex items-center gap-3 group">
      <img
        src={logo}
        alt="OurJourney logo"
        width={dim}
        height={dim}
        className="transition-transform duration-500 group-hover:scale-105"
        style={{ width: dim, height: dim }}
      />
      <span className="font-display text-xl tracking-wide text-foreground">
        Our<span className="text-primary">Journey</span>
      </span>
    </Link>
  );
}
