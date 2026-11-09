"use client";

import { useForm, ValidationError } from "@formspree/react";

export default function ContactForm() {
  const [state, handleSubmit] = useForm("xjkbzdye");

  if (state.succeeded) {
    return (
      <p className="form__done" role="status">
        Message sent. I’ll reply by email.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <label htmlFor="name">Your name</label>
      <input id="name" name="name" type="text" autoComplete="name" required />
      <ValidationError prefix="Name" field="name" errors={state.errors} className="form__error" />

      <label htmlFor="email">Your email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <ValidationError prefix="Email" field="email" errors={state.errors} className="form__error" />

      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" rows={5} required />
      <ValidationError prefix="Message" field="message" errors={state.errors} className="form__error" />

      <button type="submit" disabled={state.submitting}>
        {state.submitting ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
