import { describe, expect, it } from "bun:test";
import { ceremonyMasterMode, emptyCeremonyMaster, getCeremonyMasters, normalizeCeremonyMasters } from "./ceremonyMasters";

const contact = (name: string) => ({ ...emptyCeremonyMaster(), name });

describe("ceremony masters", () => {
  it("uses singular for one filled contact", () => {
    expect(ceremonyMasterMode([contact("Anna"), emptyCeremonyMaster()])).toBe("single");
  });
  it("supports two contacts and uses plural", () => {
    const contacts = normalizeCeremonyMasters([contact("Anna"), contact("Bas")]);
    expect(contacts.map(c => c.name)).toEqual(["Anna", "Bas"]);
    expect(ceremonyMasterMode(contacts)).toBe("multiple");
  });
  it("uses plural for more than two filled contacts", () => {
    expect(ceremonyMasterMode([contact("Anna"), contact("Bas"), contact("Cleo")])).toBe("multiple");
  });
  it("ignores blank rows and hides an empty contact section", () => {
    expect(ceremonyMasterMode([emptyCeremonyMaster()])).toBe("none");
  });
  it("preserves existing single-contact details", () => {
    expect(getCeremonyMasters({ ceremony_master_name: "Anna", ceremony_master_role: null, ceremony_master_phone: "0612345678", ceremony_master_email: null })).toEqual([{ name: "Anna", role: "", phone: "0612345678", email: "" }]);
  });
});