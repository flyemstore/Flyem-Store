import React from "react";
import { useParams } from "react-router-dom";

export default function LegalPages() {
  const { type } = useParams();

  // Content Dictionary (Replace [Bracketed Text] later)
  const content = {
    "privacy-policy": {
      title: "Privacy Policy",
      body: (
        <>
          <p>At FLYEM, we are committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.</p>
          <h3>1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you make a purchase.</p>
          <h3>2. How We Use Your Information</h3>
          <p>We use your information to process orders, communicate with you, and improve our services. We do not sell your data to third parties.</p>
        </>
      ),
    },
    "terms-conditions": {
      title: "Terms & Conditions",
      body: (
        <>
          <p>Welcome to FLYEM. By accessing or using our website, you agree to be bound by these terms.</p>
          <h3>1. Usage</h3>
          <p>You agree to use our site for lawful purposes only. You must not use our site to transmit any malicious content.</p>
          <h3>2. Purchases</h3>
          <p>All purchases are subject to availability. We reserve the right to cancel orders at our discretion.</p>
        </>
      ),
    },
    "refund-policy": {
      title: "Refund & Cancellation Policy",
      body: (
        <>
          <p>Our goal is your complete satisfaction. If you are unhappy with your purchase, please review our policy below.</p>
          <h3>1. Returns</h3>
          <p>We accept returns within 7 days of delivery for unworn, unwashed items with tags attached.</p>
          <h3>2. Refunds</h3>
          <p>Refunds are processed to the original payment method within 5-7 business days after we receive your return.</p>
          <h3>3. Cancellations</h3>
          <p>Orders can be cancelled before they are shipped by contacting support or using the 'Cancel' button in your order history.</p>
        </>
      ),
    },
    "shipping-policy": {
      title: "Shipping & Delivery",
      body: (
        <>
          <h3>1. Processing Time</h3>
          <p>Orders are processed within 1-2 business days.</p>
          <h3>2. Shipping Times</h3>
          <p>Standard shipping takes 5-7 business days across India.</p>
          <h3>3. Tracking</h3>
          <p>Once shipped, you will receive a tracking number via email.</p>
        </>
      ),
    },
    "contact-us": {
      title: "Contact Us",
      body: (
        <>
          <p>Have questions? We are here to help.</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Email:</strong> flyem.store@gmail.com</li>
            <li><strong>Phone:</strong> +91 9370817140</li>
            <li><strong>Address:</strong> Maharashtra, Pune, Yerwada, Pratik Nagar</li>
            <li><strong>Operating Hours:</strong> Mon-Fri, 10 AM - 6 PM</li>
          </ul>
        </>
      ),
    },
  };

  const page = content[type];

  if (!page) return <div className="p-20 text-center">Page Not Found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-fade-up">
      <h1 className="text-4xl font-black uppercase mb-8 font-display">{page.title}</h1>
      <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
        {page.body}
      </div>
    </div>
  );
}