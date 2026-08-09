import { createFileRoute } from "@tanstack/react-router";
import { EnvelopeLetter } from "@/wedding/EnvelopeLetter";
import { PageCanvas, Section } from "@/design-system";

export const Route = createFileRoute("/envtest")({
  component: () => (
    <PageCanvas density="quiet">
      <Section size="regular" width="prose">
        <EnvelopeLetter
          recipientFirstName="Sophie"
          recipientLastName="Laurent"
          invitationTemplate={null}
          coupleSignature="Stefano & Fleur"
        />
      </Section>
    </PageCanvas>
  ),
});
