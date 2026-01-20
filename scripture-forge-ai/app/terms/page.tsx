import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms and conditions for using ScriptureForge AI services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container px-4 md:px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 20, 2026</p>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using ScriptureForge AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any modifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              ScriptureForge AI is an AI-powered Bible study companion that provides:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Interactive Bible reading with multiple translations</li>
              <li>AI-powered chat for biblical questions and insights</li>
              <li>Daily devotionals and reading plans</li>
              <li>Prayer journal functionality</li>
              <li>Smart search capabilities</li>
              <li>Verse bookmarking and highlighting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-medium mb-3">3.1 Registration</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features, you may need to create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate.
            </p>
            <h3 className="text-xl font-medium mb-3">3.2 Account Security</h3>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Please notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Upload or transmit viruses, malware, or other harmful code</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Scrape, data mine, or use automated systems to access the Service without permission</li>
              <li>Reproduce, duplicate, or resell any part of the Service without authorization</li>
              <li>Use AI responses for purposes that misrepresent them as human-generated theological guidance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. AI-Generated Content Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Important:</strong> ScriptureForge AI uses artificial intelligence to provide insights, explanations, and devotional content. Please understand that:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>AI responses are generated based on training data and may not always be accurate or complete</li>
              <li>The Service is not a substitute for professional pastoral guidance, theological education, or scholarly study</li>
              <li>We encourage you to verify AI-generated content with trusted biblical sources and spiritual leaders</li>
              <li>Different Christian traditions may interpret scripture differently; our AI aims to be informative but not denominationally prescriptive</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <h3 className="text-xl font-medium mb-3">6.1 Our Content</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Service, including its design, features, and original content (excluding Bible text), is owned by ScriptureForge AI and protected by intellectual property laws. You may not copy, modify, or distribute our proprietary content without permission.
            </p>
            <h3 className="text-xl font-medium mb-3">6.2 Bible Text</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Bible translations are provided through licensed APIs and are subject to their respective copyright holders&apos; terms. Public domain translations (such as KJV) are freely available.
            </p>
            <h3 className="text-xl font-medium mb-3">6.3 Your Content</h3>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of content you create (such as prayer entries and notes). By using the Service, you grant us a limited license to store and display your content to provide the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Please review our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Subscription and Payments</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some features may require a paid subscription. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Pay all applicable fees as described at the time of purchase</li>
              <li>Automatic renewal unless cancelled before the renewal date</li>
              <li>Our refund policy as described on our pricing page</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCRIPTUREFORGE AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ScriptureForge AI operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Email:</strong> legal@scriptureforge.ai<br />
              <strong>Website:</strong> https://scriptureforge.ai/contact
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
