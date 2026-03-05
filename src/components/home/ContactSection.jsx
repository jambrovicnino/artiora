import { useState } from 'react';
import './ContactSection.css';

export default function ContactSection() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    e.target.reset();
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contact" className="contact">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-content">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <p>info@historyupscaled.com</p>
            <p>+1 (555) 123-4567</p>
            <p>123 Memory Lane, Heritage City</p>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="5" required />
            <button type="submit" className="btn-primary">Send Message</button>
            {sent && <p className="form-success">Thank you! We'll get back to you soon.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
