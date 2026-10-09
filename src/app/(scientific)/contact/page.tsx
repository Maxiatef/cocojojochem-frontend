import { ContactRequest } from '@/components/ocean/support/ContactRequest';
import { SupportIntro, SupportSection } from '@/components/ocean/support/SupportHelp';

/**
 * Contact, in the reference layout ("Let’s create something good.").
 *
 * Metadata and breadcrumb JSON-LD live in ./layout.tsx. The form still posts
 * to `POST /wholesale/contact-messages` — see ContactRequest.
 */
export default function ContactPage() {
  return (
    <>
      <SupportIntro
        eyebrow="Talk to our team"
        title="Let’s create something good."
        copy="Ingredient questions, documentation and projects are welcome."
      />
      <SupportSection>
        <ContactRequest />
      </SupportSection>
    </>
  );
}
