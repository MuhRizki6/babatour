import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { FAQ } from "../../data/content";

export const Faq = () => {
  return (
    <section
      id="faq"
      data-testid="faq-section"
      className="py-24 md:py-32 bg-[color:var(--bg)]"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <div className="text-sm uppercase tracking-[0.22em] text-accent font-semibold">
          Tanya Jawab
        </div>
        <h2 className="font-serif-display text-primary text-4xl sm:text-5xl mt-4 leading-tight">
          Hal yang sering ditanyakan
        </h2>
        <p className="text-muted mt-5">
          Beberapa pertanyaan umum seputar layanan umroh dan haji Baba Tour.
        </p>
      </div>

      <div className="max-w-3xl mx-auto mt-14 px-6 md:px-12">
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ.map((item, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              data-testid={`faq-item-${i}`}
              className="bg-surface border border-soft rounded-2xl px-6 data-[state=open]:bg-surface"
            >
              <AccordionTrigger className="text-left font-serif-display text-lg md:text-xl text-primary hover:no-underline py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted leading-relaxed pb-6">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
