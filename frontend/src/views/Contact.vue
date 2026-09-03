<template>
  <div class="contact-page">
    <section class="contact-hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <span class="hero-tag">LET'S CONNECT</span>

        <h1>We'd Love to Hear From You</h1>

        <p>
          Have a question, want to report a waste issue, or looking to get
          involved in creating cleaner communities? We're here to listen.
        </p>
      </div>
    </section>

    <section class="contact-section">
      <div class="contact-container">
        <div class="section-heading">
          <span>CONTACT US</span>
          <h2>Let's Make Our Spaces <strong>Cleaner</strong></h2>
          <p>
            Whether you have a question, need assistance, or want to help keep
            your community clean, reach out to us.
          </p>
        </div>

        <div class="contact-layout">
          <div class="contact-info">
            <!-- LOCATION -->
            <div class="contact-card">
              <div class="card-number"></div>

              <div class="card-icon">📍</div>

              <div class="card-content">
                <span>OUR LOCATION</span>
                <h3>Cape Town, South Africa</h3>
              </div>

              <div class="card-arrow"></div>
            </div>

            <a href="mailto:info@cleanspaces.co.za" class="contact-card">
              <div class="card-number"></div>

              <div class="card-icon">✉</div>

              <div class="card-content">
                <span>EMAIL US</span>
                <h3>info@cleanspaces.co.za</h3>
              </div>

              <div class="card-arrow"></div>
            </a>

            <a href="tel:+27000000000" class="contact-card">
              <div class="card-number"></div>

              <div class="card-icon">☎</div>

              <div class="card-content">
                <span>CALL US</span>
                <h3>+27</h3>
              </div>

              <div class="card-arrow"></div>
            </a>

            <button class="action-card report-card" @click="reportIssue">
              <div class="action-icon">🧹</div>

              <div class="action-content">
                <span>HELP KEEP OUR COMMUNITY CLEAN</span>
                <h3>Report a Waste Issue</h3>
              </div>

              <div class="card-arrow"></div>
            </button>

            <a
              href="https://wa.me/27000000000"
              target="_blank"
              rel="noopener noreferrer"
              class="action-card whatsapp-card"
            >
              <div class="action-icon">💬</div>

              <div class="action-content">
                <span>QUICK & EASY</span>
                <h3>Chat With Us on WhatsApp</h3>
              </div>

              <div class="card-arrow">→</div>
            </a>
          </div>

          <div class="message-form">
            <div class="form-heading">
              <span>SEND A MESSAGE</span>
              <h2>Get In <strong>Touch</strong></h2>
              <p>
                Have something you'd like to tell us? Fill in the form and we'll
                get back to you.
              </p>
            </div>

            <form @submit.prevent="submitForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">Full Name</label>

                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="email">Email Address</label>

                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone Number</label>

                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div class="form-group">
                  <label for="subject">Subject</label>

                  <input
                    id="subject"
                    v-model="form.subject"
                    type="text"
                    placeholder="What is this about?"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="message">Your Message</label>

                <textarea
                  id="message"
                  v-model="form.message"
                  rows="6"
                  placeholder="Tell us how we can help..."
                  required
                ></textarea>
              </div>

              <button type="submit" class="submit-btn">
                <span>Send Message</span>
                <span class="submit-arrow">→</span>
              </button>
            </form>
          </div>
          <!-- FAQ SECTION -->
          <section class="faq-section">
            <div class="faq-heading">
              <span>FREQUENTLY ASKED QUESTIONS</span>

              <h2>Got Questions? We Have <strong>Answers</strong></h2>

              <p>
                Find answers to some of the most common questions about
                CleanSpaces.
              </p>
            </div>

            <div class="faq-list">
              <!-- FAQ 1 -->
              <div class="faq-item" :class="{ active: activeFaq === 0 }">
                <button class="faq-question" @click="toggleFaq(0)">
                  <span>How do I report a waste issue?</span>

                  <span class="faq-icon">
                    {{ activeFaq === 0 ? "−" : "+" }}
                  </span>
                </button>

                <div v-if="activeFaq === 0" class="faq-answer">
                  <p>
                    You can report a waste issue by clicking the
                    <strong>Report a Waste Issue</strong> button above and
                    providing the details of the problem. This helps us identify
                    areas that need attention.
                  </p>
                </div>
              </div>

              <!-- FAQ 2 -->
              <div class="faq-item" :class="{ active: activeFaq === 1 }">
                <button class="faq-question" @click="toggleFaq(1)">
                  <span>How can I get involved with CleanSpaces?</span>

                  <span class="faq-icon">
                    {{ activeFaq === 1 ? "−" : "+" }}
                  </span>
                </button>

                <div v-if="activeFaq === 1" class="faq-answer">
                  <p>
                    You can get involved by reporting waste issues,
                    participating in community cleanups, spreading awareness,
                    and helping us promote cleaner public spaces.
                  </p>
                </div>
              </div>

              <!-- FAQ 3 -->
              <div class="faq-item" :class="{ active: activeFaq === 2 }">
                <button class="faq-question" @click="toggleFaq(2)">
                  <span>What happens after I report a waste issue?</span>

                  <span class="faq-icon">
                    {{ activeFaq === 2 ? "−" : "+" }}
                  </span>
                </button>

                <div v-if="activeFaq === 2" class="faq-answer">
                  <p>
                    Your report provides important information about the
                    location and type of waste issue. The information can then
                    be reviewed and used to help coordinate cleanup efforts.
                  </p>
                </div>
              </div>

              <!-- FAQ 4 -->
              <div class="faq-item" :class="{ active: activeFaq === 3 }">
                <button class="faq-question" @click="toggleFaq(3)">
                  <span>Can I contact CleanSpaces directly?</span>

                  <span class="faq-icon">
                    {{ activeFaq === 3 ? "−" : "+" }}
                  </span>
                </button>

                <div v-if="activeFaq === 3" class="faq-answer">
                  <p>
                    Yes. You can contact us using the email address, phone
                    number, WhatsApp button, or contact form provided above.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>

    <transition name="popup">
      <div v-if="showSuccess" class="success-popup">
        <div class="success-icon">✓</div>

        <div>
          <strong>Message Sent!</strong>
          <p>Thank you for contacting CleanSpaces.</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const showSuccess = ref(false);

const form = reactive({
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
});

const activeFaq = ref(null);

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};

const submitForm = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Something went wrong.");
      return;
    }

    showSuccess.value = true;

    setTimeout(() => {
      showSuccess.value = false;
    }, 5000);

    form.name = "";
    form.email = "";
    form.phone = "";
    form.subject = "";
    form.message = "";
  } catch (error) {
    console.error("Contact form error:", error);
    alert("Unable to send your message. Please try again.");
  }
};

const reportIssue = () => {
  // Change this route if your report issue page has a different path
  window.location.href = "/report-issue";
};
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: #f7faf8;
  color: #17251d;
}

.contact-hero {
  position: relative;
  min-height: 430px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
  overflow: hidden;

  background: linear-gradient(
    135deg,
    rgba(16, 72, 48, 0.96),
    rgba(38, 115, 77, 0.88)
  );
}

.hero-overlay {
  position: absolute;
  inset: 0;

  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(255, 255, 255, 0.12),
      transparent 35%
    ),
    radial-gradient(
      circle at 80% 80%,
      rgba(255, 255, 255, 0.08),
      transparent 35%
    );
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 780px;
}

.hero-tag {
  display: inline-block;
  margin-bottom: 20px;
  padding: 8px 16px;

  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50px;

  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
}

.hero-content h1 {
  margin: 0 0 20px;

  color: white;
  font-size: clamp(40px, 6vw, 68px);
  line-height: 1.05;
  font-weight: 800;
}

.hero-content p {
  max-width: 650px;
  margin: auto;

  color: rgba(255, 255, 255, 0.85);
  font-size: 17px;
  line-height: 1.7;
}

.contact-section {
  padding: 100px 20px;
}

.contact-container {
  max-width: 1150px;
  margin: auto;
}

.section-heading {
  max-width: 750px;
  margin-bottom: 0 auto 55px;
  text-align: center;
}

.section-heading > span,
.form-heading > span {
  color: #3b9b68;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.section-heading h2 {
  margin: 12px 0 15px;

  font-size: clamp(32px, 5vw, 52px);
  line-height: 1.1;
}

.section-heading h2 strong,
.form-heading h2 strong {
  color: #3b9b68;
}

.section-heading p {
  color: #66736b;
  font-size: 16px;
  line-height: 1.7;
}

.contact-layout {
  display: flex;
  flex-direction: column;
  gap: 70px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-card,
.action-card {
  position: relative;

  width: 100%;
  min-height: 105px;

  display: flex;
  align-items: center;

  padding: 22px 28px;

  border: 1px solid #e0e8e2;
  border-radius: 18px;

  background: white;

  text-decoration: none;
  color: inherit;

  cursor: pointer;

  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}

.contact-card:hover,
.action-card:hover {
  transform: translateY(-6px);

  border-color: #62b987;

  box-shadow: 0 18px 40px rgba(37, 91, 60, 0.12);
}

.card-number {
  width: 42px;

  color: #a1aea6;

  font-size: 12px;
  font-weight: 800;
}

.card-icon,
.action-icon {
  width: 55px;
  height: 55px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-right: 22px;

  border-radius: 15px;

  background: #edf8f1;

  font-size: 22px;

  transition:
    transform 0.35s ease,
    background 0.35s ease;
}

.contact-card:hover .card-icon,
.action-card:hover .action-icon {
  transform: scale(1.08) rotate(-4deg);
  background: #dff3e7;
}

.card-content,
.action-content {
  flex: 1;
}

.card-content span,
.action-content span {
  display: block;
  margin-bottom: 5px;

  color: #819087;

  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
}

.card-content h3,
.action-content h3 {
  margin: 0;

  font-size: 18px;
  font-weight: 700;
}

.card-arrow {
  margin-left: 20px;

  color: #3b9b68;

  font-size: 26px;

  transition: transform 0.35s ease;
}

.contact-card:hover .card-arrow,
.action-card:hover .card-arrow {
  transform: translateX(8px);
}

.action-card {
  border: none;
  text-align: left;
}

.report-card {
  margin-top: 12px;

  background: #17251d;
  color: white;
}

.report-card .action-content span {
  color: #8bcba4;
}

.report-card .action-icon {
  background: rgba(255, 255, 255, 0.1);
}

.report-card .card-arrow {
  color: #8bcba4;
}

.whatsapp-card {
  background: #e9f8ef;
  border: 1px solid #ccebd8;
}

.whatsapp-card .action-icon {
  background: white;
}

.message-form {
  padding: 50px;

  border-radius: 28px;

  background: white;

  border: 1px solid #e1e9e3;

  box-shadow: 0 20px 60px rgba(30, 70, 45, 0.08);
}

.form-heading {
  margin-bottom: 35px;
}

.form-heading h2 {
  margin: 10px 0;

  font-size: 38px;
}

.form-heading p {
  margin: 0;

  color: #718078;
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #34423a;

  font-size: 13px;
  font-weight: 700;
}

.form-group input,
.form-group textarea {
  width: 100%;
  box-sizing: border-box;

  padding: 15px 17px;

  border: 1px solid #dce5df;
  border-radius: 12px;

  background: #fbfdfb;

  color: #17251d;

  font-family: inherit;
  font-size: 14px;

  outline: none;

  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #3b9b68;

  background: white;

  box-shadow: 0 0 0 4px rgba(59, 155, 104, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 150px;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;

  width: 100%;

  padding: 16px 24px;

  border: none;
  border-radius: 12px;

  background: #26734d;
  color: white;

  font-family: inherit;
  font-size: 14px;
  font-weight: 700;

  cursor: pointer;

  transition:
    transform 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-3px);

  background: #1e6040;

  box-shadow: 0 12px 25px rgba(38, 115, 77, 0.25);
}

.submit-arrow {
  font-size: 20px;

  transition: transform 0.3s ease;
}

.submit-btn:hover .submit-arrow {
  transform: translateX(6px);
}

.success-popup {
  position: fixed;

  right: 25px;
  bottom: 25px;

  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 15px;

  padding: 18px 22px;

  border-radius: 16px;

  background: #17251d;
  color: white;

  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.success-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #3b9b68;

  font-size: 20px;
  font-weight: bold;
}

.success-popup strong {
  display: block;
  margin-bottom: 3px;
}

.success-popup p {
  margin: 0;

  color: #b9c9c0;
  font-size: 13px;
}

.popup-enter-active,
.popup-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 700px) {
  .contact-section {
    padding: 70px 16px;
  }

  .contact-card,
  .action-card {
    padding: 18px;
  }

  .card-number {
    display: none;
  }

  .card-icon,
  .action-icon {
    width: 48px;
    height: 48px;

    margin-right: 15px;
  }

  .card-content h3,
  .action-content h3 {
    font-size: 15px;
  }

  .message-form {
    padding: 28px 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .form-heading h2 {
    font-size: 32px;
  }

  .success-popup {
    left: 16px;
    right: 16px;
    bottom: 16px;
  }
}
.faq-section {
  max-width: 900px;
  margin: 100px auto 0;
}

.faq-heading {
  text-align: center;
  margin-bottom: 45px;
}

.faq-heading > span {
  color: #3b9b68;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.faq-heading h2 {
  margin: 12px 0 15px;

  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
}

.faq-heading h2 strong {
  color: #3b9b68;
}

.faq-heading p {
  max-width: 600px;
  margin: auto;

  color: #718078;
  line-height: 1.7;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-item {
  overflow: hidden;

  border: 1px solid #e0e8e2;
  border-radius: 16px;

  background: white;

  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.faq-item.active {
  border-color: #62b987;

  box-shadow: 0 12px 30px rgba(37, 91, 60, 0.08);
}

.faq-question {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 22px 25px;

  border: none;
  background: transparent;

  color: #17251d;

  font-family: inherit;
  font-size: 16px;
  font-weight: 700;

  text-align: left;

  cursor: pointer;
}

.faq-question:hover {
  color: #26734d;
}

.faq-icon {
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background: #edf8f1;

  color: #3b9b68;

  font-size: 22px;
  font-weight: 500;

  transition:
    transform 0.3s ease,
    background 0.3s ease;
}

.faq-item.active .faq-icon {
  background: #3b9b68;
  color: white;
}

.faq-answer {
  padding: 0 25px 23px;
}

.faq-answer p {
  margin: 0;

  color: #718078;

  font-size: 14px;
  line-height: 1.8;
}

.faq-answer strong {
  color: #26734d;
}

@media (max-width: 700px) {
  .faq-section {
    margin-top: 70px;
  }

  .faq-question {
    padding: 19px;
    font-size: 14px;
  }

  .faq-answer {
    padding: 0 19px 20px;
  }
}
</style>
