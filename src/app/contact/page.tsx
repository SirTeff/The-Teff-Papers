import type { Metadata } from "next";
import { EditorialPage } from "@/components/foundation/EditorialPage";
import styles from "@/components/foundation/editorial-page.module.css";

export const metadata: Metadata = { title: "Contact", description: "Connect about The Teff Papers, Fred+Teff, and the future of human-AI collaboration." };

export default function ContactPage() {
  return (
    <EditorialPage title="Contact" lead="For conversations, collaborations, research discussions, product ideas, speaking opportunities, or anything connected to The Teff Papers, Fred+Teff, personal digital intelligence, systems thinking, and the future of human-AI collaboration, you can reach out through the contact details below.">
      <div className={`prose ${styles.reading}`}>
        <p>The Teff Papers is still growing, but the direction is clear: thoughtful writing, product thinking, personal digital intelligence, systems, technology, faith, and the future of how humans work with intelligent tools.</p>
        <p>If the work connects with something you are building, researching, or thinking about, feel free to reach out.</p>
      </div>
      <address className={styles.contact}>
        <p className={styles.eyebrow}>Email</p>
        <a href="mailto:sirteffdigital@gmail.com">sirteffdigital@gmail.com</a>
      </address>
    </EditorialPage>
  );
}
