export interface CeremonyMaster {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export const emptyCeremonyMaster = (): CeremonyMaster => ({ name: "", role: "", phone: "", email: "" });

export function normalizeCeremonyMasters(value: unknown): CeremonyMaster[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item: unknown) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const text = (key: string) => typeof row[key] === "string" ? row[key].trim() : "";
    const contact = { name: text("name"), role: text("role"), phone: text("phone"), email: text("email") };
    return contact.name || contact.phone || contact.email ? [contact] : [];
  });
}

export function getCeremonyMasters(wedding: {
  ceremony_masters?: unknown;
  ceremony_master_name: string | null;
  ceremony_master_role: string | null;
  ceremony_master_phone: string | null;
  ceremony_master_email: string | null;
}): CeremonyMaster[] {
  if (Array.isArray(wedding.ceremony_masters)) return normalizeCeremonyMasters(wedding.ceremony_masters);
  return normalizeCeremonyMasters([{
    name: wedding.ceremony_master_name,
    role: wedding.ceremony_master_role,
    phone: wedding.ceremony_master_phone,
    email: wedding.ceremony_master_email,
  }]);
}

export function ceremonyMasterMode(contacts: CeremonyMaster[]): "none" | "single" | "multiple" {
  const count = normalizeCeremonyMasters(contacts).length;
  return count === 0 ? "none" : count === 1 ? "single" : "multiple";
}