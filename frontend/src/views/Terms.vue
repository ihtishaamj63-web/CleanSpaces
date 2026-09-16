<template>
  <div class="terms-page">
    <section class="terms-hero">
      <div class="hero-content">
        <span class="hero-tag">LEGAL</span>
        <h1>Terms &amp; Conditions</h1>
        <p>
          The rules that govern your use of the CleanSpaces platform and our
          community cleanup subscription service.
        </p>
        <p class="last-updated">Last updated: 15 September 2026</p>
      </div>
    </section>

    <main class="terms-content">
      <article>
        <h2>1. About These Terms</h2>
        <p>
          These terms form the agreement between you and CleanSpaces when you use
          our website, register a zone, subscribe to our cleanup services, or
          submit reports and reviews. By creating an account or making a
          contribution, you accept these terms.
        </p>
      </article>

      <article>
        <h2>2. Our Service</h2>
        <p>
          CleanSpaces provides scheduled street cleanup services to communities
          that subscribe collectively. Zones are activated once 60% of their
          households have contributed, and every completed cleanup is documented
          with before-and-after photographic proof. We employ vetted local crew
          members and work with certified waste disposal partners for hazardous
          materials.
        </p>
      </article>

      <article>
        <h2>3. Subscriptions &amp; Payments</h2>
        <ul>
          <li>
            Subscriptions are billed monthly in advance. Your household's
            contribution is calculated from your zone's plan and is shown before
            you pay.
          </li>
          <li>
            All payments are processed securely by PayFast. CleanSpaces never
            collects or stores your card details — card information is entered
            only on PayFast's PCI DSS Level 1 certified payment page.
          </li>
          <li>
            A zone activates once 60% of its households have contributed. Before
            activation, funds are held against the zone and no cleanup services
            are scheduled.
          </li>
          <li>
            Contributions are month-to-month with no lock-in contract. You may
            stop contributing at any time; your zone's service level depends on
            continued community participation.
          </li>
          <li>
            If participation in your zone falls below the activation threshold,
            cleanups pause until the threshold is met again.
          </li>
        </ul>
      </article>

      <article>
        <h2>4. Zone Registration</h2>
        <p>
          Zone registrations are reviewed by our team before activation.
          Registering a zone does not guarantee activation, and you confirm that
          the contact details you provide are accurate and that you have the
          authority to act on behalf of your street committee or residents'
          association.
        </p>
      </article>

      <article>
        <h2>5. Acceptable Use</h2>
        <p>When using the CleanSpaces platform, you agree not to:</p>
        <ul>
          <li>Submit false reports or misleading information about waste issues</li>
          <li>Upload photos that are not your own or that depict unrelated locations</li>
          <li>Register duplicate or fictitious zones</li>
          <li>Attempt to access other users' accounts or data</li>
          <li>Use the platform for any unlawful purpose</li>
        </ul>
        <p>
          Submitted reviews are moderated before publication. We reserve the
          right to reject or remove any content that violates these terms.
        </p>
      </article>

      <article>
        <h2>6. Your Data</h2>
        <p>
          We collect only the information needed to run the service: your name,
          email, phone number, and payment records. In line with the Protection
          of Personal Information Act (POPIA), your data is used solely for
          account management, payment processing, and service communication. We
          do not sell or share your personal information with third parties
          beyond what is required to process payments (PayFast) and deliver
          services. You may request deletion of your account at any time by
          contacting us.
        </p>
      </article>

      <article>
        <h2>7. Service Limitations</h2>
        <p>
          CleanSpaces provides scheduled cleanup of public spaces as described
          in your zone's plan. We are not a municipal waste removal service and
          do not service private properties, handle building rubble from
          renovations, or remove hazardous materials except through our
          certified disposal partners as part of a scheduled cleanup. Weather,
          safety conditions, or circumstances beyond our control may
          occasionally delay a scheduled cleanup.
        </p>
      </article>

      <article>
        <h2>8. Liability</h2>
        <p>
          Our liability is limited to the contributions you have made in the
          current billing period. We are not liable for indirect losses arising
          from service delays or interruptions. Nothing in these terms limits
          liability that cannot be limited under South African law.
        </p>
      </article>

      <article>
        <h2>9. Changes to These Terms</h2>
        <p>
          We may update these terms as the service evolves. Material changes
          will be communicated to registered users, and continued use of the
          platform after changes take effect constitutes acceptance.
        </p>
      </article>

      <article>
        <h2>10. Contact</h2>
        <p>
          Questions about these terms? Reach us at
          <a href="mailto:cleanspaces.team@outlook.com">cleanspaces.team@outlook.com</a>
          or through the <router-link to="/contact" class="inline-link">contact page</router-link>.
        </p>
      </article>
    </main>
  </div>
</template>

<script setup>
// Static Terms & Conditions page — no backend logic required.
</script>

<style scoped>
.terms-page {
  min-height: 100vh;
  background: #f7faf8;
  color: #17251d;
}

/* Hero band — same family as the other public pages */
.terms-hero {
  position: relative;
  padding: 90px 8% 70px;
  text-align: center;
  background: linear-gradient(135deg, #eaf6ed 0%, #f7fbf8 55%, #dff0e5 100%);
  overflow: hidden;
}

.terms-hero::before {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(76, 175, 112, 0.08);
  right: -80px;
  top: -80px;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
}

.hero-tag {
  display: inline-block;
  margin-bottom: 16px;
  color: #198044;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.terms-hero h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  line-height: 1.05;
  letter-spacing: -2px;
  color: #173b27;
}

.terms-hero p {
  margin: 20px auto 0;
  max-width: 560px;
  color: #5e7165;
  font-size: 16px;
  line-height: 1.7;
}

.last-updated {
  margin-top: 24px;
  font-size: 13px;
  color: #8a978f;
}

/* Content sections */
.terms-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 70px 20px 90px;
  display: grid;
  gap: 48px;
}

.terms-content article {
  background: #ffffff;
  border: 1px solid #e4eee7;
  border-radius: 18px;
  padding: 32px 34px;
}

.terms-content h2 {
  margin: 0 0 14px;
  color: #173b27;
  font-size: 1.3rem;
}

.terms-content p {
  margin: 0;
  color: #4f5f57;
  line-height: 1.8;
}

.terms-content ul {
  margin: 12px 0 0;
  padding-left: 1.2rem;
  color: #4f5f57;
  line-height: 1.8;
  display: grid;
  gap: 6px;
}

.inline-link {
  color: #198044;
  font-weight: 600;
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .terms-hero { padding: 70px 7% 55px; }
  .terms-content { padding-top: 50px; gap: 30px; }
  .terms-content article { padding: 24px 20px; }
}
</style>