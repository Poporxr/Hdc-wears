import InfoPage from "@/components/InfoPage";

const faqs = [
  {
    q: "Where do you deliver?",
    a: "We deliver across Nigeria. Delivery fees and timelines are confirmed at checkout based on your location.",
  },
  {
    q: "How do sizes run?",
    a: "Our tees are a relaxed, true-to-size fit. If you like an oversized look, go one size up.",
  },
  {
    q: "What is your return policy?",
    a: "Unworn items with tags intact can be returned within 7 days of delivery. Custom pieces are final sale.",
  },
  {
    q: "When will out-of-stock items restock?",
    a: "Most drops are limited runs and don't restock. Follow us on Instagram and TikTok for drop announcements.",
  },
  {
    q: "How do I care for my pieces?",
    a: "Machine wash cold, inside out. Hang dry to keep prints crisp.",
  },
];

export default function FaqPage() {
  return (
    <InfoPage title="FAQ">
      <div className="space-y-6">
        {faqs.map((f) => (
          <div key={f.q}>
            <h2 className="font-bold text-neutral-900 mb-1">{f.q}</h2>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
