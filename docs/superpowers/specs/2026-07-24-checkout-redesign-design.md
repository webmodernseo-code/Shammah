# Checkout Redesign — Design Spec

Date: 2026-07-24
Status: Approved

## Context

Shammah's checkout screen (`#checkout-screen` in [index.html](../../../index.html), styled in
[css/shammah.css](../../../css/shammah.css), driven by [js/shammah.js](../../../js/shammah.js)) currently
has a 2-step flow (Livraison → Paiement) with a plain text breadcrumb stepper, and ends by
showing a toast and redirecting straight back to the shop. The user supplied a reference
screenshot of a different checkout UI (hotel-booking template) and asked for the Shammah
checkout to be redesigned to match its visual language, while keeping Shammah's existing
business logic (cart, shipping cost calc, promo code, Mobile Money / card payment simulation).

Two scope questions were resolved with the user before this spec:
- Add a real third step ("Terminé") with a dedicated confirmation screen, instead of the
  current toast-only completion.
- Keep the current column order (form on the left, order summary on the right) — do **not**
  mirror the reference's left/right arrangement.

## Goals

- Restyle the checkout stepper as 3 steps (Livraison → Paiement → Terminé) with circular
  icons, a green checkmark on completed steps, and a connecting line — matching the
  reference's stepper visual.
- Restyle the payment method selector (currently pill tabs "Mobile Money" / "Carte Bancaire")
  as two bordered, selectable method cards, matching the reference's "Select method" cards.
- Add flag emoji to the phone country-prefix dropdown options.
- Add a cosmetic "save my info for 1-click checkout" checkbox to the card payment form
  (no backend — purely visual, consistent with the rest of this demo site).
- Add a real Step 3 "Terminé" confirmation screen: success icon, generated order number,
  thank-you message, "Continuer mes achats" button back to the shop. Both the Mobile Money
  simulation and the card-payment simulation must end on this screen instead of their current
  toast + immediate redirect.
- Restyle the order summary (right column) as a "Product Review"-style card: product rows
  with thumbnail + title + size/color meta + price, the existing promo code input (SHAMMAH10),
  and the existing cost breakdown (subtotal / shipping / estimated tax / total).
- Add a small "SHAMMAH" wordmark at the top-left of the checkout screen, above the existing
  back-to-shop button.

## Non-goals

- No functional/business-logic changes: shipping cost rules, promo code logic (`SHAMMAH10`),
  tax calculation, and the Mobile Money / card simulation timings stay exactly as they are today.
- No hotel-template-specific concepts that don't map to Shammah: no tiered discount chips
  (5%/10%/15%), no "Credit" line item, no "GST (10%) Inclusive" relabeling of the existing
  "Taxes estimées" line.
- No column-order swap (left/right stays as today).
- No changes to any other screen (shop, product detail, cart drawer, tracking, filters).

## Design

### 1. Stepper (3 steps)

Replace `.checkout-breadcrumbs` (currently two `<span class="step-indicator">` text labels
joined by a `>` separator) with three circular step nodes connected by a line:
- Completed step: filled circle with a white checkmark, green/dark background.
- Active step: filled dark circle with the step number.
- Upcoming step: outlined circle with the step number, muted color.
Label text (Livraison / Paiement / Terminé) sits below or beside each node, matching the
reference's "Information / Payment / Completed" stepper. Pure CSS + a small JS function that
toggles `completed` / `active` classes on the three step nodes (replaces the current
2-state `indicatorStep1`/`indicatorStep2` toggle logic with a 3-state version).

### 2. Payment method selector

Replace `.payment-tabs-selector` pill buttons with two side-by-side bordered cards (icon +
label), each acting like a radio choice: selected card gets an accent border + subtle
background tint, unselected stays neutral. Same two options as today (Mobile Money, Carte
Bancaire) — only the visual treatment changes framework (from pill-tab to card-select).
Existing `data-pay-type` click-handling logic is reused unchanged, only the DOM/CSS of the
buttons changes.

### 3. Card form additions

- Phone country-prefix `<select>` options get a leading flag emoji (🇨🇮 CIV +225, 🇧🇯 BEN +229,
  🇸🇳 SEN +221, 🇫🇷 FRA +33, 🇮🇳 IND +91) for both the shipping-step phone field and the
  card form context. Purely a label change, `value` attributes unchanged.
- New checkbox below the card form (and, symmetrically, below the Mobile Money form):
  "Enregistrer mes informations pour un paiement en 1 clic" with a muted helper subtext.
  Checked by default. No persistence — purely decorative, consistent with the existing
  `demo-autofill-btn`.

### 4. Step 3 — "Terminé" confirmation screen

New `#checkout-step-3-content` panel (same pattern as the existing two step panels): success
checkmark icon, "Commande confirmée !" heading, a generated order number (`SH-` + random
5-digit number, reusing the existing tracking-number style already implied by the tracking
drawer's `SH-10294` placeholder), a short thank-you paragraph, and a
"Continuer mes achats" button that returns to the shop screen (replaces today's automatic
`shopScreen.style.display = "block"` timeout jump).

Both `submitMomoBtn`'s success branch and `submitCardBtn`'s `setTimeout` success branch are
changed to: keep the user on the checkout screen, hide step 2, show step 3 with the generated
order number, and mark the stepper's 3rd node active/completed — instead of immediately
hiding the checkout screen and toasting. The cart-clearing / form-reset behavior they already
do stays unchanged.

### 5. Order summary card (right column)

Visual-only restyle of `.checkout-cart-items` rows and the surrounding card to match the
reference's "Product Review" card: rounded thumbnail, product title, a meta line showing
size + color variant name (already available as `item.size` / `item.variant.name`), and the
price — same data already rendered by `renderCheckoutSummary()`, just restyled. Promo code
input/button and the cost breakdown block keep their current fields, restyled to the
reference's spacing/typography.

### 6. Checkout header wordmark

Small "SHAMMAH" text logo added above `.checkout-back-header`, left-aligned, reusing the same
font treatment as the site's existing `.logo` class.

## Testing

Manual verification in a local browser (desktop + mobile viewport), covering:
- Full happy path: add item → checkout → fill shipping (or demo-autofill) → continue to
  payment → pick Mobile Money, complete simulated payment → land on step 3 with an order
  number → "Continuer mes achats" returns to a clean shop screen.
- Same path via the card payment method.
- Stepper visual state (checkmarks / active / upcoming) at each of the 3 steps.
- No console errors; cart is empty and checkout resets correctly after completion.
