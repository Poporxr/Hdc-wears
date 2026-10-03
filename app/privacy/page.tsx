import InfoPage from "@/components/InfoPage";

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-bold text-neutral-900 text-base pt-2">{children}</h2>
  );
}

export default function PrivacyPage() {
  return (
    <InfoPage title="PRIVACY POLICY">
      <p className="text-xs text-neutral-400">Last updated: October 2026</p>
      <p>
        HDC Wears (&quot;we&quot;, &quot;us&quot;) respects your privacy. This
        policy explains what data we collect, how we use it, and who else can
        access it. No legalese games — just the facts.
      </p>

      <H>1. What we collect</H>
      <p>
        <strong>Account details.</strong> When you sign in with Google we
        receive your name, email address, and profile photo from Google. If
        you add a phone number to your profile or at checkout, we store that
        too.
      </p>
      <p>
        <strong>Order details.</strong> When you check out we collect your
        name, email, phone number, delivery address, and the items you
        ordered so we can fulfill and update you about your order.
      </p>
      <p>
        <strong>On your device only.</strong> Your cart and wishlist are
        stored in your browser&apos;s local storage. They never leave your
        device unless you place an order.
      </p>
      <p>
        <strong>Emails.</strong> If you create an account, we may email you
        about new drops, restocks, and order updates. Every marketing email
        includes a way to opt out.
      </p>

      <H>2. How we use it</H>
      <p>
        We use your data to run the store: create and manage your account,
        process and deliver orders, send order and stock updates, and (only
        if you have an account) tell you about new drops. We do not sell
        your data. We do not run ads based on it.
      </p>

      <H>3. Who else has access</H>
      <p>
        We rely on a small set of service providers to operate the store.
        Each only receives the data it needs to do its job:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Google Firebase</strong> — handles sign-in and stores
          account and order data securely in the cloud.
        </li>
        <li>
          <strong>Resend</strong> — delivers our emails (order confirmations,
          drop announcements, stock alerts). Receives your email address and
          name.
        </li>
        <li>
          <strong>Cloudinary</strong> — hosts product and gallery images. No
          personal data involved.
        </li>
        <li>
          <strong>Vercel</strong> — hosts this website. Standard web hosting:
          basic request logs (like IP addresses) for security and
          reliability.
        </li>
      </ul>
      <p>
        We never give these providers permission to use your data for their
        own marketing, and we never sell or rent your information to anyone.
      </p>

      <H>4. Your rights</H>
      <p>
        You can view and edit your name and phone number anytime on your{" "}
        <a href="/account" className="underline">
          account page
        </a>
        . To delete your account and personal data, or to ask what data we
        hold about you, email us through the contact page below and
        we&apos;ll handle it within 7 days.
      </p>

      <H>5. Security</H>
      <p>
        Sign-in is handled by Google — we never see or store passwords.
        Admin access to customer data is restricted to authorized store
        operators only.
      </p>

      <H>6. Changes</H>
      <p>
        If this policy changes materially, we&apos;ll update the date above.
        Continued use of the store means you accept the updated policy.
      </p>

      <H>7. Contact</H>
      <p>
        Questions about your data? Reach us through the{" "}
        <a href="/contact" className="underline">
          contact page
        </a>
        .
      </p>
    </InfoPage>
  );
}
