import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Last updated: May 31, 2026
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed mb-12">
            Air Current Eng. Solution ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
            when you visit our website aircurrentengineeringsolution.com (the "Website"), 
            use our services, or otherwise communicate with us.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Information We Collect */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Information We Collect
            </h2>
            <p className="text-muted-foreground mb-4">
              We may collect various types of information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Personal Information:</strong> Name, email address, phone number, 
                mailing address, and other contact details you voluntarily provide when 
                filling out forms, subscribing to newsletters, or requesting services.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you access and use our 
                Website, including IP address, browser type, operating system, pages visited, 
                and time spent on our site.
              </li>
              <li>
                <strong>Cookies and Tracking Technologies:</strong> We use cookies and similar 
                tracking technologies to collect information about your browsing activities 
                and to improve your experience on our Website.
              </li>
              <li>
                <strong>Communications:</strong> Any messages you send to us via email, 
                contact forms, or other channels, as well as recordings of phone calls 
                with our customer service team (with your consent where required).
              </li>
            </ul>
          </div>

          {/* How We Use Your Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              How We Use Your Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We may use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                To provide, maintain, and improve our services and Website.
              </li>
              <li>
                To process your requests, inquiries, and transactions.
              </li>
              <li>
                To communicate with you about our services, promotions, and updates.
              </li>
              <li>
                To personalize your experience on our Website.
              </li>
              <li>
                To analyze usage trends and improve our Website's functionality.
              </li>
              <li>
                To comply with legal obligations and protect our rights.
              </li>
              <li>
                To prevent fraudulent activities and ensure security.
              </li>
            </ul>
          </div>

          {/* Sharing Your Information */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Sharing Your Information
            </h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or otherwise transfer your personal information to 
              third parties except in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Service Providers:</strong> With trusted third parties who assist 
                us in operating our Website, conducting our business, or providing services 
                to you, provided they agree to keep this information confidential.
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court order, 
                or governmental regulations.
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with, or during 
                negotiations of, any merger, sale of company assets, financing, or 
                acquisition of all or a portion of our business to another company.
              </li>
              <li>
                <strong>With Your Consent:</strong> For any other purpose with your 
                explicit consent.
              </li>
            </ul>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Your Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have certain rights regarding your 
              personal information, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                The right to access, update, or delete the information we have about you.
              </li>
              <li>
                The right to object to or restrict certain uses of your information.
              </li>
              <li>
                The right to receive your information in a portable format.
              </li>
              <li>
                The right to withdraw consent at any time (where we relied on consent 
                to process your information).
              </li>
              <li>
                The right to lodge a complaint with a supervisory authority.
              </li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at 
              <a href="mailto:privacy@aircurrentengineeringsolution.com" className="text-accent hover:underline">
                privacy@aircurrentengineeringsolution.com
              </a>.
            </p>
          </div>

          {/* Data Security */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Data Security
            </h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect 
              your personal information from accidental or unlawful destruction, loss, 
              alteration, unauthorized disclosure, or access. However, no method of 
              transmission over the Internet or electronic storage is 100% secure, and 
              we cannot guarantee absolute security.
            </p>
          </div>

          {/* International Transfers */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              International Transfers
            </h2>
            <p className="text-muted-foreground mb-4">
              If you are located outside of Sri Lanka and choose to provide information 
              to us, please note that we transfer the information, including personal 
              information, to Sri Lanka and process it there. Your consent to this 
              Privacy Policy followed by your submission of such information represents 
              your agreement to this transfer.
            </p>
          </div>

          {/* Children's Privacy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Children's Privacy
            </h2>
            <p className="text-muted-foreground mb-4">
              Our Website is not directed to children under the age of 13, and we do not 
              knowingly collect personal information from children under 13. If you are 
              a parent or guardian and believe that your child has provided us with 
              personal information, please contact us. If we become aware that we have 
              collected personal information from a child under 13 without verification 
              of parental consent, we will take steps to remove that information from 
              our servers.
            </p>
          </div>

          {/* Changes to This Policy */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground mb-4">
              We may update our Privacy Policy from time to time. We will notify you 
              of any changes by posting the new Privacy Policy on this page and updating 
              the "Last updated" date at the top of this policy.
            </p>
            <p className="text-muted-foreground">
              You are advised to review this Privacy Policy periodically for any changes. 
              Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </div>

          {/* Contact Us */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Contact Us
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong>Email:</strong> 
                <a href="mailto:privacy@aircurrentengineeringsolution.com" className="text-accent hover:underline">
                  privacy@aircurrentengineeringsolution.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong> +94 70 153 3195
              </li>
              <li>
                <strong>Address:</strong> Colombo 7, Sri Lanka
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Back to Home Link */}
      <section className="bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link href="/" className="text-accent hover:text-accent/80 transition-colors">
            ← Return to Homepage
          </Link>
        </div>
      </section>
    </>
  );
}