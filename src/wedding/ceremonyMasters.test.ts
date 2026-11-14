import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { ceremonyMasterMode, emptyCeremonyMaster, getCeremonyMasters, normalizeCeremonyMasters } from "./ceremonyMasters";

const contact = (name: string) => ({ ...emptyCeremonyMaster(), name });

describe("ceremony masters", () => {
  it("uses singular for one filled contact", () => {
    assert.equal(ceremonyMasterMode([contact("Anna"), emptyCeremonyMaster()]), "single");
  });
  it("supports two contacts and uses plural", () => {
    const contacts = normalizeCeremonyMasters([contact("Anna"), contact("Bas")]);
    assert.deepEqual(contacts.map(c => c.name), ["Anna", "Bas"]);
    assert.equal(ceremonyMasterMode(contacts), "multiple");
  });
  it("uses plural for more than two filled contacts", () => {
    assert.equal(ceremonyMasterMode([contact("Anna"), contact("Bas"), contact("Cleo")]), "multiple");
  });
  it("ignores blank rows and hides an empty contact section", () => {
    assert.equal(ceremonyMasterMode([emptyCeremonyMaster()]), "none");
  });
  it("preserves existing single-contact details", () => {
    assert.deepEqual(getCeremonyMasters({ ceremony_master_name: "Anna", ceremony_master_role: null, ceremony_master_phone: "0612345678", ceremony_master_email: null }), [{ name: "Anna", role: "", phone: "0612345678", email: "" }]);
  });
});