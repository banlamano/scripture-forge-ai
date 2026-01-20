import { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Learn about how ScriptureForge AI uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container px-4 md:px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 20, 2026</p>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how their site is being used.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ScriptureForge AI uses cookies and similar technologies for several purposes:
            </p>
            
            <h3 className="text-xl font-medium mb-3">2.1 Essential Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies are necessary for the website to function properly. They enable core functionality such as:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
              <li>User authentication and session management</li>
              <li>Security features and fraud prevention</li>
              <li>Remembering your login status</li>
              <li>Loading balancing and server optimization</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Preference Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies remember your settings and preferences:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
              <li>Language preferences</li>
              <li>Theme settings (light/dark mode)</li>
              <li>Default Bible translation</li>
              <li>Reading progress and bookmarks</li>
              <li>Font size and display preferences</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.3 Analytics Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use analytics cookies to understand how visitors interact with our website:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
              <li>Pages visited and time spent on each page</li>
              <li>Features used most frequently</li>
              <li>Error tracking and performance monitoring</li>
              <li>General usage patterns to improve our service</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We use Vercel Analytics, which is privacy-focused and does not use cookies that track individuals across websites.
            </p>

            <h3 className="text-xl font-medium mb-3">2.4 Functional Cookies</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              These cookies enable enhanced functionality:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Chat history storage</li>
              <li>Offline Bible reading capabilities</li>
              <li>Progressive Web App (PWA) functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some cookies are placed by third-party services that appear on our pages:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border mt-4">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left">Provider</th>
                    <th className="border border-border px-4 py-2 text-left">Purpose</th>
                    <th className="border border-border px-4 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Vercel</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Hosting and analytics</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Essential/Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Google (OAuth)</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Authentication</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Stripe</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Payment processing</td>
                    <td className="border border-border px-4 py-2 text-muted-foreground">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Local Storage and IndexedDB</h2>
            <p className="text-muted-foreground leading-relaxed">
              In addition to cookies, we use browser local storage and IndexedDB to store data locally on your device. This enables features like:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>Offline Bible reading</li>
              <li>Cached chat conversations</li>
              <li>Saved verses and notes</li>
              <li>Reading plan progress</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This data remains on your device and is not transmitted to our servers unless you are signed in and choose to sync your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Managing Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control and manage cookies in several ways:
            </p>
            
            <h3 className="text-xl font-medium mb-3">5.1 Browser Settings</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific sites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Please note that blocking essential cookies may affect the functionality of our website.
            </p>

            <h3 className="text-xl font-medium mb-3">5.2 Browser-Specific Instructions</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
              <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
              <li><strong>Edge:</strong> Settings → Privacy & Security → Cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookie Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              Different cookies have different retention periods:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them</li>
              <li><strong>Authentication cookies:</strong> Typically 30 days (or until you sign out)</li>
              <li><strong>Preference cookies:</strong> Up to 1 year</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. When we make changes, we will update the &quot;Last updated&quot; date at the top of this page. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies or this Cookie Policy, please contact us at:
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              <strong>Email:</strong> privacy@scriptureforge.ai<br />
              <strong>Website:</strong> https://scriptureforge.ai/contact
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Related Policies</h2>
            <p className="text-muted-foreground leading-relaxed">
              For more information about how we handle your data, please also review our:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li><a href="/privacy" className="text-primary hover:underline">Privacy Policy</a></li>
              <li><a href="/terms" className="text-primary hover:underline">Terms of Service</a></li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
