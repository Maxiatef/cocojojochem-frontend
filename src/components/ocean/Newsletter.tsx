"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Mail, ArrowUpRight, FlaskConical, Sparkles, Package, Tag, ShieldCheck } from "lucide-react";
import { customerApi } from "@/lib/customerApi";
import { ApiError } from "@/lib/api";
import { getFriendlyErrorMessage } from "@/lib/errorMessages";

/**
 * The ocean design's newsletter (reference app/newsletter.tsx), markup
 * unchanged, wired to our backend (/wholesale/newsletter/*). A signup returns
 * a private preferences token once; it is kept in this browser and shown as a
 * "Manage preferences" link (/email-preferences#<token>).
 */
const newsletterInterests = [
  { id: "ingredients", label: "Ingredients & new arrivals" },
  { id: "formulation", label: "Formulation education" },
  { id: "wholesale", label: "Wholesale offers" },
  { id: "packaging", label: "Packaging updates" },
] as const;

const storedLink = "cj-newsletter-preferences";
type NewsletterResult = {
  message?: string;
  token?: string;
  email?: string;
  interests?: string[];
  status?: string;
};
const ROUTES = {
  subscribe: "/wholesale/newsletter/subscribe",
  read: "/wholesale/newsletter/preferences/read",
  preferences: "/wholesale/newsletter/preferences",
  unsubscribe: "/wholesale/newsletter/unsubscribe",
};
async function requestNewsletter({ action, ...body }: { action: keyof typeof ROUTES } & Record<string, unknown>) {
  try {
    return await customerApi.post<NewsletterResult>(ROUTES[action], body);
  } catch (e) {
    throw new Error(
      e instanceof ApiError && e.serverMessage ? e.serverMessage : getFriendlyErrorMessage(e, "newsletter"),
    );
  }
}
function saveLink(token: string) {
  try {
    localStorage.setItem(storedLink, token);
  } catch {}
}
function InterestChoices({
  value,
  onChange,
  disabled = false,
  visual = false,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  visual?: boolean;
}) {
  return (
    <fieldset className="nl-interests" disabled={disabled}>
      <legend>What would you like to hear about?</legend>
      <div>
        {newsletterInterests.map((i) => (
          <label key={i.id} className={value.includes(i.id) ? "selected" : ""}>
            <input
              type="checkbox"
              checked={value.includes(i.id)}
              onChange={(e) => onChange(e.target.checked ? [...value, i.id] : value.filter((x) => x !== i.id))}
            />
            {visual && (
              <span className="nl-topic-icon" aria-hidden="true">
                {i.id === "ingredients" ? (
                  <Sparkles size={18} />
                ) : i.id === "formulation" ? (
                  <FlaskConical size={18} />
                ) : i.id === "wholesale" ? (
                  <Tag size={18} />
                ) : (
                  <Package size={18} />
                )}
              </span>
            )}
            <span>{i.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function PrivateLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(false);
  const path = "/email-preferences#" + token;
  return (
    <div className="nl-private-link">
      <a href={path}>Manage preferences</a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.origin + path);
            setCopied(true);
          } catch {
            setError(true);
          }
        }}
      >
        {copied ? "Link copied" : "Copy private link"}
      </button>
      <small>Keep this private link to manage your signup on another device.</small>
      {error && <small>Open “Manage preferences” and copy the page address.</small>}
    </div>
  );
}
export function NewsletterSignup() {
  const [email, setEmail] = useState(""),
    [interests, setInterests] = useState<string[]>(["ingredients", "formulation"]),
    [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [token, setToken] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const website = (new FormData(event.currentTarget).get("website") as string) || undefined;
    try {
      const data = await requestNewsletter({ action: "subscribe", email, interests, consent, website });
      if (data.token) {
        setToken(data.token);
        saveLink(data.token);
      }
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="nl-section" aria-labelledby="newsletter-heading">
      <div className="nl-atmosphere" aria-hidden="true">
        <img
          src="/assets/footer-blue-molecules.webp"
          alt=""
          width={1536}
          height={1024}
          loading="lazy"
          draggable={false}
        />
      </div>
      <div className="r-wrap nl-layout">
        <div className="nl-copy">
          <h2 id="newsletter-heading">
            Good chemistry.
            <br />
            <span>In your inbox.</span>
          </h2>
          <p>Fresh ingredients, formulation ideas, and useful updates for what you create next.</p>
          <div className="nl-copy-note">
            <span aria-hidden="true" />
            <span>A little inspiration for your next creation.</span>
          </div>
        </div>
        <div className="nl-form-area">
          {done ? (
            <div className="nl-success" role="status">
              <Check size={26} aria-hidden="true" />
              <h3>Thank you for joining.</h3>
              <p>New signups are saved. If you have signed up before, your existing preferences stay unchanged.</p>
              {token ? <PrivateLink token={token} /> : <a href="/email-preferences">Manage an existing signup</a>}
            </div>
          ) : (
            <form onSubmit={submit} aria-busy={busy}>
              <div className="nl-form-heading">
                <div>
                  <h3>Curated around you.</h3>
                  <p>Choose what inspires you.</p>
                </div>
                <span className="nl-form-mark" aria-hidden="true">
                  <Sparkles size={22} />
                </span>
              </div>
              <label className="nl-email-label" htmlFor="newsletter-email">
                Email address
              </label>
              <div className="nl-email-row">
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  maxLength={254}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
                <button className="r-btn r-primary" type="submit" disabled={busy}>
                  <span>{busy ? "Saving…" : "Subscribe"}</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </div>
              <InterestChoices value={interests} onChange={setInterests} disabled={busy} visual />
              <div className="nl-honey" aria-hidden="true">
                <label>
                  Website
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <label className="nl-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  disabled={busy}
                />
                <span>
                  I agree to receive the COCOJOJO email updates I select. I can unsubscribe anytime.{" "}
                  <a href="/legal/privacy-policy">Privacy policy</a>
                </span>
              </label>
              {error && (
                <p className="nl-error" role="alert">
                  {error}
                </p>
              )}
              <div className="nl-form-bottom">
                <ShieldCheck size={15} aria-hidden="true" />
                <a className="nl-manage-link" href="/email-preferences">
                  Manage preferences or unsubscribe
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
export function NewsletterPreferences() {
  const [token, setToken] = useState(""),
    [email, setEmail] = useState(""),
    [interests, setInterests] = useState<string[]>([]),
    [status, setStatus] = useState(""),
    [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  useEffect(() => {
    let active = true;
    let key = location.hash.slice(1);
    if (!key)
      try {
        key = localStorage.getItem(storedLink) || "";
      } catch {}
    if (!key) {
      setLoading(false);
      return;
    }
    setToken(key);
    requestNewsletter({ action: "read", token: key })
      .then((data) => {
        if (!active) return;
        setEmail(data.email || "");
        setInterests(data.interests || []);
        setStatus(data.status || "pending");
        saveLink(key);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function update(action: "preferences" | "unsubscribe") {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await requestNewsletter(
        action === "unsubscribe" ? { action, token } : { action, token, interests, consent },
      );
      setStatus(data.status || "pending");
      setNotice(data.message || "Your preferences have been saved.");
      setConsent(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p role="status">Loading your preferences…</p>;
  if (!email)
    return (
      <div className="nl-preferences">
        <h2>Your private preferences link</h2>
        <p>Open the link you saved after signing up, or use the browser where you subscribed.</p>
        {error && (
          <p className="nl-error" role="alert">
            {error}
          </p>
        )}
        <p>
          If you no longer have the link,{" "}
          <a href="/contact?subject=Email%20subscription%20help">
            contact us for help managing or removing your signup
          </a>
          .
        </p>
      </div>
    );
  return (
    <div className="nl-preferences">
      <span className="nl-kicker">
        <Mail size={18} /> YOUR EMAIL PREFERENCES
      </span>
      <h2>{status === "unsubscribed" ? "You are unsubscribed." : "Make it relevant to you."}</h2>
      <p>{email}</p>
      {status === "unsubscribed" && <p>You will not receive COCOJOJO email updates from this list.</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update("preferences");
        }}
        aria-busy={busy}
      >
        <InterestChoices value={interests} onChange={setInterests} disabled={busy} />
        {status === "unsubscribed" && (
          <label className="nl-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
            <span>I would like to receive these COCOJOJO email updates again.</span>
          </label>
        )}
        <div className="nl-actions">
          <button className="r-btn r-primary" disabled={busy}>
            {busy ? "Saving…" : status === "unsubscribed" ? "Subscribe again" : "Save interests"}
          </button>
          {status !== "unsubscribed" && (
            <button className="r-btn r-outline" type="button" disabled={busy} onClick={() => update("unsubscribe")}>
              Unsubscribe from all
            </button>
          )}
        </div>
      </form>
      {notice && (
        <p className="nl-notice" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="nl-error" role="alert">
          {error}
        </p>
      )}
      <PrivateLink token={token} />
    </div>
  );
}
