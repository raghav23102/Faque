import { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy | Faque App" },
    { name: "description", content: "Privacy Policy for the Faque Shopify App" },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div style={{ fontFamily: "sans-serif", lineHeight: "1.6", maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Privacy Policy for Faque App</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>Last updated: September 3, 2026</p>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>1. Introduction</h2>
        <p>
          Welcome to the Faque App ("we", "our", "us"). We respect your privacy and are committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you install and use the Faque App on your Shopify store.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>2. Information We Collect</h2>
        <p>When you install the App, we automatically access certain types of information from your Shopify account:</p>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li style={{ marginBottom: "8px" }}><strong>Store Information:</strong> We collect your shop domain and basic store details to authenticate and provide the app's services.</li>
          <li style={{ marginBottom: "8px" }}><strong>FAQ Data:</strong> We store the FAQ content (questions, answers, and categories) that you explicitly create within the App.</li>
          <li style={{ marginBottom: "8px" }}><strong>Theme Information:</strong> We access your theme to securely embed the FAQ blocks via App Proxies and Theme App Extensions.</li>
        </ul>
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>We do NOT collect, access, or store any personal customer data (such as names, emails, or order histories) from your storefront.</p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li style={{ marginBottom: "8px" }}>Provide, operate, and maintain the App's features.</li>
          <li style={{ marginBottom: "8px" }}>Render your FAQs accurately on your Shopify storefront.</li>
          <li style={{ marginBottom: "8px" }}>Process subscription billing through Shopify's secure Billing API.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>4. Data Retention and Deletion (GDPR)</h2>
        <p>
          We comply with Shopify's GDPR requirements. If you uninstall the app, or if you or a customer requests data erasure via Shopify's privacy webhooks, we will securely delete the corresponding data within the required timeframes. Because we do not store personal customer data, customer data erasure requests will result in no action needed on our end.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@flamaradigital.online.
        </p>
      </section>
    </div>
  );
}
