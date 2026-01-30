import { useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface SEOContentProps {
  faqs: FAQItem[];
  pageName: string;
}

export const SEOContent: React.FC<SEOContentProps> = ({ faqs, pageName }) => {
  useEffect(() => {
    // Add FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    const schemaId = `faq-schema-${pageName}`;
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = schemaId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [faqs, pageName]);

  return (
    <div className="mt-24 space-y-16">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-8">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 md:p-8 rounded-3xl border border-white/5 bg-white/[0.015] backdrop-blur-xl hover:bg-white/[0.025] transition-all"
            >
              <h3 className="text-lg md:text-xl font-medium text-white mb-4">{faq.question}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  useEffect(() => {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    };

    const schemaId = "breadcrumb-schema";
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = schemaId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(breadcrumbSchema);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [items]);

  return (
    <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <span className="opacity-40">/</span>}
          <a
            href={item.url}
            className={idx === items.length - 1 ? "text-white font-medium" : "hover:text-white transition-colors"}
          >
            {item.name}
          </a>
        </div>
      ))}
    </nav>
  );
};

export default SEOContent;
