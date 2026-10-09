"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { customerApi } from "@/lib/customerApi";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

/**
 * The reference contact form (`RequestCheckout kind="inquiry"` in the
 * reference store-client): the "1 Your details 2 Review & submit" card with
 * name, email, company, location, message, a hidden `r-honeypot` field and the
 * consent checkbox.
 *
 * It posts to OUR backend exactly as before — `POST /wholesale/contact-messages`
 * with `{ fullName, email, phone?, subject, message }` (CreateContactMessageDto,
 * forbidNonWhitelisted). The reference's company / location fields are not DTO
 * fields, so they are added to the message text. The honeypot is never sent:
 * when it is filled the submission is dropped client-side and the visitor sees
 * the normal confirmation.
 *
 * `?subject=` (services, packaging, documents, accessibility link here with
 * one) becomes the message subject and, like the reference, opens the message.
 * It is read from `window.location` after mount rather than `useSearchParams`,
 * which would opt the page out of static rendering.
 */
const DEFAULT_SUBJECT = "Website inquiry";

export function ContactRequest() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    const preset = new URLSearchParams(window.location.search)
      .get("subject")
      ?.trim()
      .slice(0, 200);
    if (preset) {
      setSubject(preset);
      setMessage((current) => current || preset + "\n\n");
    }
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const text = (name: string) => String(f.get(name) ?? "").trim();
    // Spam trap: real visitors never see or fill the "Website" field.
    if (text("website")) {
      setDone("");
      return;
    }
    const company = text("company");
    const destination = text("destination");
    const details = [
      company && "Company: " + company,
      destination && "Location: " + destination,
    ].filter(Boolean);
    setBusy(true);
    try {
      const saved = await customerApi.post<{ id?: string | number }>(
        "/wholesale/contact-messages",
        {
          fullName: text("name"),
          email: text("email"),
          subject: subject || DEFAULT_SUBJECT,
          message: details.length
            ? message.trim() + "\n\n" + details.join("\n")
            : message.trim(),
        },
      );
      setDone(saved && saved.id != null ? String(saved.id) : "");
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    setDone(null);
    setMessage("");
    setSubject("");
    setAgreed(false);
  }

  if (done !== null)
    return (
      <div className="r-confirmation" role="status">
        <CheckCircle2 size={54} aria-hidden="true" />
        <span className="r-eyebrow">Successfully received</span>
        <h2>Your message is saved.</h2>
        {done && (
          <p>
            Reference <strong>CJ-{done.slice(0, 8).toUpperCase()}</strong>
          </p>
        )}
        <p>
          Your message is available to our team for review. We reply by email,
          usually within one business day.
        </p>
        <a className="r-btn r-primary" href="/shop">
          Continue shopping
        </a>
        <button type="button" className="r-btn r-outline" onClick={startOver}>
          Send another message
        </button>
      </div>
    );

  return (
    <div className="r-checkout-layout">
      <form className="r-form-card" onSubmit={submit}>
        <div className="r-step-label">
          <span>1</span> Your details <span>2</span> Review &amp; submit
        </div>
        <h2>How can we help?</h2>
        <p>Share your question with our team.</p>
        <div className="r-form-grid">
          <label className="r-field">
            Full name
            <input name="name" required autoComplete="name" maxLength={120} />
          </label>
          <label className="r-field">
            Email address
            <input
              name="email"
              required
              type="email"
              autoComplete="email"
              maxLength={200}
            />
          </label>
          <label className="r-field">
            Company <small>optional</small>
            <input name="company" autoComplete="organization" maxLength={200} />
          </label>
          <label className="r-field">
            Location (optional)
            <input
              name="destination"
              autoComplete="address-level2"
              maxLength={600}
            />
          </label>
          <label className="r-field r-full">
            Your message
            <textarea
              name="message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your preferred pack, intended use or delivery needs."
              maxLength={5000}
            />
          </label>
          <div className="r-honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </div>
        <label className="r-consent">
          <input
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          I agree that the details I provide may be used to respond to my
          inquiry. <a href="/legal/privacy-policy">Privacy information</a>
        </label>
        {error && (
          <p className="r-error" role="alert">
            {error}
          </p>
        )}
        <button className="r-btn r-primary" disabled={busy} type="submit">
          {busy ? (
            <>
              <LoaderCircle className="r-spin" size={17} aria-hidden="true" />
              Submitting…
            </>
          ) : (
            "Send message"
          )}
        </button>
        <p className="r-fine">
          Your message goes straight to our team, and we reply by email, usually
          within one business day.
        </p>
      </form>
      <ContactAside />
    </div>
  );
}

function ContactAside() {
  return (
    <aside className="r-summary">
      <h2>Prefer to speak with us?</h2>
      <p>
        Discuss an ingredient, request a document or tell us about your project.
      </p>
      <a href="mailto:support@cocojojo.com">support@cocojojo.com</a>
      <a href="tel:+19496107164">+1 949 610 7164</a>
    </aside>
  );
}
