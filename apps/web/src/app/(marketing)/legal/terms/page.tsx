import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Siza',
  description: 'Terms and conditions for using the Siza platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-2">
        Terms of Service
      </h1>
      <p className="text-sm text-[#71717A] mb-12">Last updated: February 28, 2026</p>

      <div className="space-y-8 text-[#A1A1AA] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">1. Acceptance</h2>
          <p>
            By accessing or using Siza (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">2. The Service</h2>
          <p>
            Siza is an open-source AI workspace that generates production-grade UI code. The Service
            includes the web application, desktop application, MCP tools, and associated APIs.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">3. Accounts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must be at least 13 years old to use the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">
            4. Generated code ownership
          </h2>
          <p>
            Code generated through Siza belongs to you. You may use, modify, and distribute
            generated code without restriction. We claim no intellectual property rights over your
            generated output.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">5. Free and paid tiers</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              The free tier includes limited generations per month as described on the pricing page
            </li>
            <li>Paid subscriptions are billed monthly via Stripe</li>
            <li>You may cancel at any time; access continues until the end of the billing period</li>
            <li>Refunds are handled on a case-by-case basis</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">6. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Use the Service to generate malicious code or malware</li>
            <li>Attempt to bypass rate limits or usage quotas</li>
            <li>Reverse engineer the AI generation pipeline</li>
            <li>Use automated tools to scrape or abuse the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">
            7. Limitation of liability
          </h2>
          <p>
            The Service is provided &quot;as is&quot; without warranty of any kind. Siza is not
            liable for any damages arising from the use of generated code in production environments.
            You are responsible for reviewing and testing all generated code before deployment.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">8. Open source</h2>
          <p>
            Siza&apos;s source code is available under the MIT License. These Terms govern the
            hosted Service at forgespace.co. Self-hosted instances are governed by the MIT License
            only.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">9. Changes</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes
            constitutes acceptance. Material changes will be communicated via email.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#FAFAFA] mb-3">10. Contact</h2>
          <p>
            Questions? Email{' '}
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
