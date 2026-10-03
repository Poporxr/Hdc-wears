import InfoPage from "@/components/InfoPage";

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-neutral-900 text-base pt-2">{children}</h2>
  );
}

export default function TermsPage() {
  return (
    <InfoPage title="TERMS OF SERVICE">
      <p className="text-xs text-neutral-400">Last updated: October 2026</p>
      <p>
        By shopping at HDC Wears you agree to these terms. If you
        don&apos;t agree, please don&apos;t use the store.
      </p>

      <H>1. Products and pricing</H>
      <p>
        All products are original HDC Wears pieces. Prices are listed in
        Nigerian Naira (₦) and include all applicable taxes. We work hard to
        keep prices accurate, but if a price is listed incorrectly we reserve
        the right to cancel the order and refund you in full.
      </p>

      <H>2. Orders</H>
      <p>
        Placing an order is an offer to buy. We confirm every order by email,
        and the sale is final once we confirm. We may cancel an order (for
        example, if an item is out of stock) and refund you in full — we will
        always tell you why.
      </p>

      <H>3. Payment</H>
      <p>
        Payments are processed through trusted third-party payment providers.
        Your card and bank details go directly to the provider — we never see
        or store them.
      </p>

      <H>4. Shipping and delivery</H>
      <p>
        We deliver across Nigeria. Delivery times and fees are shown at
        checkout before you pay. Once your order ships, we&apos;ll email you
        with tracking details where available. Delivery dates are estimates,
        not guarantees.
      </p>

      <H>5. Returns and exchanges</H>
      <p>
        Changed your mind? You have 7 days from delivery to request a return
        or exchange, provided the item is unworn, unwashed, and in its
        original condition with tags attached. To start a return, contact us
        through the{" "}
        <a href="/contact" className="underline">
          contact page
        </a>{" "}
        with your order number. Refunds go back to your original payment
        method within 7–14 business days of us receiving the item.
      </p>

      <H>6. Custom design requests</H>
      <p>
        Custom pieces requested through our design form are made to order.
        Because they&apos;re made for you specifically, custom items are
        final sale unless faulty.
      </p>

      <H>7. Your account</H>
      <p>
        You sign in with Google and are responsible for keeping your Google
        account secure. If we notice misuse of the store (fraud, abuse of
        returns, automated scraping), we may restrict or close the account.
      </p>

      <H>8. Our content</H>
      <p>
        Everything on this site — product photos, designs, copy, and the HDC
        Wears name and marks — belongs to us. Don&apos;t copy, reproduce, or
        resell it without written permission.
      </p>

      <H>9. Liability</H>
      <p>
        We do our best to keep the store accurate and available, but we
        can&apos;t promise it will be error-free or uninterrupted at all
        times. To the extent allowed by law, our liability for any order is
        limited to the amount you paid for it.
      </p>

      <H>10. Changes</H>
      <p>
        We may update these terms as the store grows (for example, when new
        payment or delivery options launch). The date above shows the latest
        version — continued use of the store means you accept it.
      </p>

      <H>11. Contact</H>
      <p>
        Questions about these terms? Reach us through the{" "}
        <a href="/contact" className="underline">
          contact page
        </a>
        .
      </p>
    </InfoPage>
  );
}
