# Forms and capture

**None of these submit anywhere in the prototype.** They validate, acknowledge,
and clear. Wiring them up is part of the build.

Four capture points. They are the commercial purpose of the page.

| # | Where | Fields | Button |
|---|---|---|---|
| 1 | Contribute (left of Contribute/Contact) | Email | Register |
| 2 | Contact (right of the same) | Email | Get in touch |
| 3 | Newshub | Email | Subscribe |
| 4 | Request full index (modal) | First name, Last name, Company name, Position, Email | Send request |

## Where they go — confirmed

**All four write to a Supabase table**, and send a notification email.

| Form | Notify |
|---|---|
| Contribute | `index@redbookagency.com` |
| Contact | `index@redbookagency.com` |
| Newshub | `index@redbookagency.com` |
| Request full index | `index@redbookagency.com` **and** `vihaan@redbookagency.com` |

Suggested columns: `id`, `source` (which of the four), `email`, `first_name`,
`last_name`, `company`, `position`, `created_at`, plus referrer or UTM if useful.
The four extra fields are null for forms 1–3.

**"Request full index" raises a request — it does not deliver the file.**
Someone at RedBook sends the index by email. So no file delivery, signed URLs or
expiry are needed; the notification email needs to carry all five fields in a
form someone can act on.

**No double opt-in** on the Newshub signup.

## Still needed

- **Spam protection.** Four unprotected email fields on a public page will be
  found. A honeypot field plus a submit-timing check handles most of it without a
  CAPTCHA; Turnstile if that proves insufficient.
- **Server-side validation.** The client rule below is a courtesy, not a control.
- **A success state that survives.** The current inline acknowledgement is
  cosmetic.

## Validation

One rule, applied to every email field including the modal's.

```js
var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
```

Deliberately loose. It catches the mistakes people actually make — no `@`, no
domain, a trailing comma — without rejecting valid but unusual addresses. Don't
replace it with something stricter without a reason.

Listens on the **capture** phase, so a bad address stops the modal closing before
its own submit handler runs. Order matters.

On failure the row takes `.is-bad`, which outlines the whole control — input and
button both, see `06-components.md` — the field gets `aria-invalid`, and a
message appears. The message is positioned out of flow so a field turning red
cannot shove the layout around it.

The three inline bars acknowledge and clear on success. The modal closes.
