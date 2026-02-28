import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Siza',
  description: 'How Siza handles your data and protects your privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-[#71717A] mb-12">Last updated: February 28, 2026</p>

      <div className="space-y-8 text-[#A1A1AA] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">Overview</h2>
          <p>
            Siza (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is an open-source AI workspace
            for code generation. We respect your privacy and are committed to protecting your
            personal data. This policy explains how we collect, use, and safeguard your information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">Data we collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-[#FAFAFA]">Account data:</strong> Email address and display
              name when you create an account via email, Google, or GitHub OAuth.
            </li>
            <li>
              <strong className="text-[#FAFAFA]">Usage data:</strong> Generation requests, feature
              usage, and error logs to improve the platform.
            </li>
            <li>
              <strong className="text-[#FAFAFA]">Payment data:</strong> Processed securely by
              Stripe. We never store card numbers or financial credentials.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">How we use your data</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide and maintain the Siza platform</li>
            <li>To process payments and manage subscriptions</li>
            <li>To send transactional emails (verification, password reset)</li>
            <li>To improve our AI generation quality</li>
          </ul>
          <p className="mt-3">
            We do not sell your data. We do not use your generated code for AI training.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">Third-party services</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-[#FAFAFA]">Supabase:</strong> Authentication and database
              (hosted in AWS us-east-1)
            </li>
            <li>
              <strong className="text-[#FAFAFA]">Stripe:</strong> Payment processing
            </li>
            <li>
              <strong className="text-[#FAFAFA]">Cloudflare:</strong> Hosting and CDN
            </li>
            <li>
              <strong className="text-[#FAFAFA]">Resend:</strong> Transactional emails
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">Your rights</h2>
          <p>
            You can request access to, correction of, or deletion of your personal data at any time
            by contacting{' '}
            <a
              href="mailto:support@forgespace.co"
              className="text-[#8B5CF6] hover:underline"
            >
              support@forgespace.co
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">Open source</h2>
          <p>
            Siza is MIT-licensed open-source software. You can inspect exactly how your data is
            handled by reviewing our{' '}
            <a
              href="https://github.com/Forge-Space/siza"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B5CF6] hover:underline"
            >
              source code
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">Contact</h2>
          <p>
            Questions about this policy? Email{' '}
            <a
              href="mailto:support@forgespace.co"
              className="text-[#8B5CF6] hover:underline"
            >
              support@forgespace.co
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
