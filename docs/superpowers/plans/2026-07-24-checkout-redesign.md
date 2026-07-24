# Checkout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle Shammah's checkout screen (3-step stepper with checkmarks, card-style payment method selector, phone-flag emoji, a cosmetic "save info" checkbox, and a real order-confirmation "Terminé" step) to match a reference UI the user supplied, while keeping every existing business rule (shipping cost, `SHAMMAH10` promo code, tax, Mobile Money / card simulation timings) byte-for-byte unchanged.

**Architecture:** This is a static site — one `index.html`, one `css/shammah.css`, one `js/shammah.js`, no build step, no framework, no package.json. Every task edits these three files directly. There is no unit-test framework in this repo; verification is done by serving the site with a local static file server and driving it with headless Chromium via Playwright (the same method already used earlier in this project's history — see Task 1's setup). Each task's "test" is a small Playwright script that asserts on real DOM state and CSS classes in an actual rendered page, run before the change (to see it fail/not-apply) and after (to see it pass).

**Tech Stack:** Vanilla HTML/CSS/JS. Verification tooling: Python's `http.server` (static file server) + Node.js + Playwright (Chromium), installed fresh into a scratch directory — no dependency on any pre-existing global cache.

## Global Constraints

- No functional/business-logic changes: shipping cost rule (`$9.00` express / `$0.00` standard), the `SHAMMAH10` promo code (10% off), the `$5.00` flat estimated tax, and the Mobile Money (15s) / card (2s) simulation timings stay exactly as they are today.
- No hotel-template concepts that don't map to Shammah: no tiered discount chips (5%/10%/15%), no "Credit" line item, no relabeling "Taxes estimées" to "GST".
- No column-order swap — the shipping/payment form stays in `.checkout-left-col`, the order summary stays in `.checkout-right-col`, exactly as today.
- No changes to any other screen (shop, product detail, cart drawer, tracking, filters, bottom nav).
- All new user-facing copy is in French, matching the rest of the site.
- Reuse the existing CSS custom properties — `--accent-dark`, `--accent-light`, `--text-primary`, `--text-secondary`, `--bg-primary`, `--shadow-card`, `--font-inter`, `--transition-smooth` — defined in `css/shammah.css:3-15`. Do not introduce new hard-coded colors where one of these fits.
- Spec source of truth: `docs/superpowers/specs/2026-07-24-checkout-redesign-design.md`.

---

## Task 1: Test environment + 3-step stepper with checkmarks

This task also sets up the one-time Playwright verification environment reused by every later task in this plan — don't repeat the `npm install` in later tasks, just reuse this same directory and the still-running static server.

**Files:**
- Modify: `index.html:238-242` (the `.checkout-breadcrumbs` markup)
- Modify: `css/shammah.css:1048-1073` (the old `.checkout-breadcrumbs`/`.step-indicator`/`.separator` rules)
- Modify: `js/shammah.js:887-917` (`goToCheckout`), `js/shammah.js:1003-1060` (`checkoutToPaymentBtn` / `checkoutBackToStep1` handlers, plus removal of now-dead top-level consts at `js/shammah.js:1006-1009`)
- Test: `/tmp/shammah-checkout-tests/test-task1.js` (scratch, not committed to the repo)

**Interfaces:**
- Produces: `setCheckoutStep(stepNumber)` — a global function. Called with `1`, `2`, or `3`. Sets `.active`/`.completed` classes on `#step-node-1`/`#step-node-2`/`#step-node-3` and their connectors, and shows/hides `#checkout-step-1-content` / `#checkout-step-2-content` / `#checkout-step-3-content` (the third one doesn't exist until Task 4 — `setCheckoutStep` must tolerate a missing `#checkout-step-3-content` via a null check, since Task 1 lands before Task 4).
- Consumes: nothing from other tasks.

- [ ] **Step 1: Set up the scratch Playwright environment (one-time)**

```bash
mkdir -p /tmp/shammah-checkout-tests
cd /tmp/shammah-checkout-tests
npm init -y
npm install playwright
npx playwright install chromium
```

- [ ] **Step 2: Start the static file server and leave it running**

Run this in the project root (adjust the path if your checkout differs), in the background — leave it running for the rest of this plan:

```bash
cd "/c/Users/monep/OneDrive/Desktop/Tous mes dossiers/PROJET WEB/Shammah 2.0"
python -m http.server 8811 --bind 127.0.0.1 &
disown
timeout 20 bash -c 'until curl -sf http://127.0.0.1:8811/index.html >/dev/null; do sleep 1; done'
```

Expected: the `timeout` command exits `0` (server is serving).

- [ ] **Step 3: Write the failing test**

Create `/tmp/shammah-checkout-tests/test-task1.js`:

```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(BASE);
  await page.waitForSelector('.product-card');
  await page.locator('.product-card .add-cart-fast-btn').first().click();
  await page.click('#desktop-cart-btn');
  await page.click('#checkout-action-btn');
  await page.waitForSelector('#checkout-screen', { state: 'visible' });

  const step1Active = await page.locator('#step-node-1').evaluate(el => el.classList.contains('active')).catch(() => false);
  const step3Exists = await page.locator('#step-node-3').count();
  console.log('step1Active =', step1Active, '(expected true after the change)');
  console.log('step3Exists =', step3Exists, '(expected 1 after the change)');
  console.log('console/page errors:', errors.length, errors);

  await browser.close();
})();
```

- [ ] **Step 4: Run it and confirm it shows the old (2-step) behavior**

```bash
node /tmp/shammah-checkout-tests/test-task1.js
```

Expected: `step1Active = false` and `step3Exists = 0` (the `#step-node-1`/`#step-node-3` elements don't exist yet — the old markup uses `#indicator-step-1`/`#indicator-step-2`).

- [ ] **Step 5: Replace the stepper markup**

In `index.html`, replace:

```html
            <div class="checkout-breadcrumbs">
              <span class="step-indicator active" id="indicator-step-1">1. Livraison</span>
              <span class="separator">&gt;</span>
              <span class="step-indicator" id="indicator-step-2">2. Paiement</span>
            </div>
```

with:

```html
            <div class="checkout-breadcrumbs" id="checkout-stepper">
              <div class="step-node active" id="step-node-1">
                <span class="step-circle">
                  <svg class="step-check" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                  <span class="step-number">1</span>
                </span>
                <span class="step-label">Livraison</span>
              </div>
              <div class="step-connector"></div>
              <div class="step-node" id="step-node-2">
                <span class="step-circle">
                  <svg class="step-check" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                  <span class="step-number">2</span>
                </span>
                <span class="step-label">Paiement</span>
              </div>
              <div class="step-connector"></div>
              <div class="step-node" id="step-node-3">
                <span class="step-circle">
                  <svg class="step-check" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                  <span class="step-number">3</span>
                </span>
                <span class="step-label">Terminé</span>
              </div>
            </div>
```

- [ ] **Step 6: Replace the stepper CSS**

In `css/shammah.css`, replace this whole block (currently at approximately lines 1048-1073):

```css
.checkout-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.step-indicator {
  cursor: pointer;
  transition: var(--transition-smooth);
}

.step-indicator.active {
  color: var(--text-primary);
  border-bottom: 2px solid var(--text-primary);
  padding-bottom: 2px;
}

.checkout-breadcrumbs .separator {
  opacity: 0.5;
}
```

with:

```css
.checkout-breadcrumbs {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.step-circle {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--accent-light);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-smooth);
}

.step-number {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.step-check {
  display: none;
  width: 14px;
  height: 14px;
  color: #ffffff;
}

.step-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.step-node.active .step-circle {
  border-color: var(--text-primary);
  background: var(--text-primary);
}

.step-node.active .step-number {
  color: #ffffff;
}

.step-node.active .step-label {
  color: var(--text-primary);
}

.step-node.completed .step-circle {
  border-color: #4caf50;
  background: #4caf50;
}

.step-node.completed .step-number {
  display: none;
}

.step-node.completed .step-check {
  display: block;
}

.step-node.completed .step-label {
  color: var(--text-primary);
}

.step-connector {
  flex: 1;
  height: 2px;
  background: var(--accent-light);
  margin: 0 10px 20px 10px;
  transition: var(--transition-smooth);
}

.step-connector.completed {
  background: #4caf50;
}
```

- [ ] **Step 7: Add `setCheckoutStep()` and wire it into the existing step transitions**

In `js/shammah.js`, immediately before `function goToCheckout() {` (currently line 887), add:

```javascript
function setCheckoutStep(stepNumber) {
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`step-node-${i}`);
    if (!node) continue;
    node.classList.remove("active", "completed");
    if (i < stepNumber) node.classList.add("completed");
    else if (i === stepNumber) node.classList.add("active");
  }
  document.querySelectorAll(".step-connector").forEach((connector, idx) => {
    connector.classList.toggle("completed", idx < stepNumber - 1);
  });

  const step1Content = document.getElementById("checkout-step-1-content");
  const step2Content = document.getElementById("checkout-step-2-content");
  const step3Content = document.getElementById("checkout-step-3-content");
  if (step1Content) step1Content.style.display = stepNumber === 1 ? "block" : "none";
  if (step2Content) step2Content.style.display = stepNumber === 2 ? "block" : "none";
  if (step3Content) step3Content.style.display = stepNumber === 3 ? "block" : "none";
}
```

Then, inside `goToCheckout()`, replace:

```javascript
  // Initialize step display
  const step1Content = document.getElementById("checkout-step-1-content");
  const step2Content = document.getElementById("checkout-step-2-content");
  const indicatorStep1 = document.getElementById("indicator-step-1");
  const indicatorStep2 = document.getElementById("indicator-step-2");
  if (step1Content) step1Content.style.display = "block";
  if (step2Content) step2Content.style.display = "none";
  if (indicatorStep1) indicatorStep1.classList.add("active");
  if (indicatorStep2) indicatorStep2.classList.remove("active");
```

with:

```javascript
  // Initialize step display
  setCheckoutStep(1);
```

Then find this block (currently around line 1004-1010):

```javascript
const checkoutToPaymentBtn = document.getElementById("checkout-to-payment-btn");
const checkoutBackToStep1 = document.getElementById("checkout-back-to-step-1");
const step1Content = document.getElementById("checkout-step-1-content");
const step2Content = document.getElementById("checkout-step-2-content");
const indicatorStep1 = document.getElementById("indicator-step-1");
const indicatorStep2 = document.getElementById("indicator-step-2");
const checkoutShippingForm = document.getElementById("checkout-shipping-form");
```

and remove the four now-unused const lines, leaving:

```javascript
const checkoutToPaymentBtn = document.getElementById("checkout-to-payment-btn");
const checkoutBackToStep1 = document.getElementById("checkout-back-to-step-1");
const checkoutShippingForm = document.getElementById("checkout-shipping-form");
```

Then inside the `checkoutToPaymentBtn` click handler, replace:

```javascript
    // Switch panels
    if (step1Content) step1Content.style.display = "none";
    if (step2Content) step2Content.style.display = "block";
    
    // Update breadcrumbs
    if (indicatorStep1) indicatorStep1.classList.remove("active");
    if (indicatorStep2) indicatorStep2.classList.add("active");
    
    window.scrollTo({ top: 0, behavior: "smooth" });
```

with:

```javascript
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
```

Then replace the whole `checkoutBackToStep1` handler:

```javascript
if (checkoutBackToStep1) {
  checkoutBackToStep1.addEventListener("click", () => {
    if (step1Content) step1Content.style.display = "block";
    if (step2Content) step2Content.style.display = "none";
    
    if (indicatorStep1) indicatorStep1.classList.add("active");
    if (indicatorStep2) indicatorStep2.classList.remove("active");
    
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
```

with:

```javascript
if (checkoutBackToStep1) {
  checkoutBackToStep1.addEventListener("click", () => {
    setCheckoutStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
```

- [ ] **Step 8: Re-run the test and confirm it now passes**

```bash
node /tmp/shammah-checkout-tests/test-task1.js
```

Expected: `step1Active = true`, `step3Exists = 1`, `console/page errors: 0 []`.

Also manually extend the same script (or run it interactively) to click `#checkout-to-payment-btn` after using `#demo-autofill-btn`, and confirm `#step-node-1` gets class `completed` (with its checkmark SVG visible) and `#step-node-2` gets class `active`. Then click `#checkout-back-to-step-1` and confirm `#step-node-1` is `active` again.

- [ ] **Step 9: Commit**

```bash
git add index.html css/shammah.css js/shammah.js
git commit -m "$(cat <<'EOF'
Restyle checkout stepper as 3 steps with checkmarks

Replaces the 2-step text breadcrumb (Livraison/Paiement) with a
3-node circular stepper (Livraison/Paiement/Terminé) matching the
reference design, centralizing the step-switching logic into a
single setCheckoutStep() function.
EOF
)"
```

---

## Task 2: Payment method selector as bordered cards

**Files:**
- Modify: `index.html:350-353` (`.payment-tabs-selector` / `.pay-tab-btn` markup)
- Modify: `css/shammah.css` (add new rules; there are no existing `.payment-tabs-selector`/`.pay-tab-btn` CSS rules to remove — today's styling is 100% inline `style="..."` attributes in the HTML)
- Modify: `js/shammah.js:1062-1087` (the `payTabBtns` click handler)
- Test: reuse `/tmp/shammah-checkout-tests/` from Task 1 (server should still be running; if not, repeat Task 1 Step 2)

**Interfaces:**
- Consumes: none.
- Produces: none consumed by later tasks (Task 4's success-state changes don't touch this selector).

- [ ] **Step 1: Write the failing test**

Create `/tmp/shammah-checkout-tests/test-task2.js`:

```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE);
  await page.waitForSelector('.product-card');
  await page.locator('.product-card .add-cart-fast-btn').first().click();
  await page.click('#desktop-cart-btn');
  await page.click('#checkout-action-btn');
  await page.click('#demo-autofill-btn');
  await page.click('#checkout-to-payment-btn');
  await page.waitForSelector('#checkout-step-2-content', { state: 'visible' });

  const cardCount = await page.locator('.payment-method-card').count();
  console.log('payment-method-card count =', cardCount, '(expected 2 after the change)');

  await browser.close();
})();
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
node /tmp/shammah-checkout-tests/test-task2.js
```

Expected: `payment-method-card count = 0` (the class doesn't exist yet — today it's `.pay-tab-btn`).

- [ ] **Step 3: Replace the selector markup**

In `index.html`, replace:

```html
                <div class="payment-tabs-selector" style="display: flex; gap: 8px; background: var(--bg-primary); padding: 4px; border-radius: 24px; margin-bottom: 24px;">
                  <button class="pay-tab-btn active" data-pay-type="momo" style="flex: 1; height: 38px; border: none; border-radius: 20px; font-family: var(--font-inter); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: var(--transition-smooth);">Mobile Money</button>
                  <button class="pay-tab-btn" data-pay-type="card" style="flex: 1; height: 38px; border: none; border-radius: 20px; font-family: var(--font-inter); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: var(--transition-smooth); background: transparent; color: var(--text-secondary);">Carte Bancaire</button>
                </div>
```

with:

```html
                <div class="payment-method-selector">
                  <button class="payment-method-card active" data-pay-type="momo">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1zM11 18h2" /></svg>
                    <span>Mobile Money</span>
                  </button>
                  <button class="payment-method-card" data-pay-type="card">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 10h20" /></svg>
                    <span>Carte Bancaire</span>
                  </button>
                </div>
```

- [ ] **Step 4: Add the CSS**

Append to `css/shammah.css` (anywhere near the other `.checkout-*` rules, e.g. right after the `.checkout-card h3` rule):

```css
.payment-method-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.payment-method-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  border: 1.5px solid var(--accent-light);
  border-radius: 16px;
  background: #ffffff;
  color: var(--text-secondary);
  font-family: var(--font-inter);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.payment-method-card svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.payment-method-card:hover {
  border-color: #bbbbbb;
}

.payment-method-card.active {
  border-color: var(--text-primary);
  color: var(--text-primary);
  background: var(--bg-primary);
}
```

- [ ] **Step 5: Simplify the JS handler**

In `js/shammah.js`, replace:

```javascript
// Tab Switching (Mobile Money / Card)
const payTabBtns = document.querySelectorAll(".pay-tab-btn");
payTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    payTabBtns.forEach(b => {
      b.classList.remove("active");
      b.style.background = "transparent";
      b.style.color = "var(--text-secondary)";
    });
    btn.classList.add("active");
    btn.style.background = "#ffffff";
    btn.style.color = "var(--text-primary)";
    
    const type = btn.getAttribute("data-pay-type");
    const panelMomo = document.getElementById("payment-panel-momo");
    const panelCard = document.getElementById("payment-panel-card");
    
    if (type === "momo") {
      if (panelMomo) panelMomo.style.display = "block";
      if (panelCard) panelCard.style.display = "none";
    } else {
      if (panelMomo) panelMomo.style.display = "none";
      if (panelCard) panelCard.style.display = "block";
    }
  });
});
```

with:

```javascript
// Tab Switching (Mobile Money / Card)
const payTabBtns = document.querySelectorAll(".payment-method-card");
payTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    payTabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const type = btn.getAttribute("data-pay-type");
    const panelMomo = document.getElementById("payment-panel-momo");
    const panelCard = document.getElementById("payment-panel-card");

    if (type === "momo") {
      if (panelMomo) panelMomo.style.display = "block";
      if (panelCard) panelCard.style.display = "none";
    } else {
      if (panelMomo) panelMomo.style.display = "none";
      if (panelCard) panelCard.style.display = "block";
    }
  });
});
```

- [ ] **Step 6: Re-run the test and confirm it passes**

```bash
node /tmp/shammah-checkout-tests/test-task2.js
```

Expected: `payment-method-card count = 2`. Also manually click the "Carte Bancaire" card and confirm the card form panel (`#payment-panel-card`) becomes visible and the Mobile Money panel hides — the underlying show/hide behavior must be unchanged.

- [ ] **Step 7: Commit**

```bash
git add index.html css/shammah.css js/shammah.js
git commit -m "$(cat <<'EOF'
Restyle payment method selector as bordered cards

Replaces the pill-tab Mobile Money / Carte Bancaire selector with
two bordered, icon-labeled cards matching the reference design.
Same underlying data-pay-type click logic, now driven by a CSS
class instead of manually-set inline styles.
EOF
)"
```

---

## Task 3: Phone country flags + cosmetic "save info" checkbox

**Files:**
- Modify: `index.html` (the `#phone-country-prefix` `<select>` options; the end of `#payment-panel-momo` and `#payment-panel-card`)
- Modify: `css/shammah.css` (add `.save-info-checkbox-row` rules)
- Test: reuse `/tmp/shammah-checkout-tests/`

**Interfaces:** none produced or consumed — purely additive, decorative markup.

- [ ] **Step 1: Write the failing test**

Create `/tmp/shammah-checkout-tests/test-task3.js`:

```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE);

  const firstOptionText = await page.locator('#phone-country-prefix option').first().textContent();
  const momoCheckboxCount = await page.locator('#save-info-momo-checkbox').count();
  const cardCheckboxCount = await page.locator('#save-info-card-checkbox').count();
  console.log('first phone option text =', JSON.stringify(firstOptionText), '(expected to start with a flag emoji after the change)');
  console.log('momoCheckboxCount =', momoCheckboxCount, 'cardCheckboxCount =', cardCheckboxCount, '(expected 1 and 1 after the change)');

  await browser.close();
})();
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
node /tmp/shammah-checkout-tests/test-task3.js
```

Expected: `first phone option text = "CIV +225"` (no flag yet), `momoCheckboxCount = 0`, `cardCheckboxCount = 0`.

- [ ] **Step 3: Add flag emoji to the phone prefix options**

In `index.html`, replace:

```html
                        <select id="phone-country-prefix" class="country-prefix-select">
                          <option value="+225">CIV +225</option>
                          <option value="+229">BEN +229</option>
                          <option value="+221">SEN +221</option>
                          <option value="+33">FRA +33</option>
                          <option value="+91">IND +91</option>
                        </select>
```

with:

```html
                        <select id="phone-country-prefix" class="country-prefix-select">
                          <option value="+225">🇨🇮 CIV +225</option>
                          <option value="+229">🇧🇯 BEN +229</option>
                          <option value="+221">🇸🇳 SEN +221</option>
                          <option value="+33">🇫🇷 FRA +33</option>
                          <option value="+91">🇮🇳 IND +91</option>
                        </select>
```

- [ ] **Step 4: Add the "save info" checkbox to the Mobile Money panel**

In `index.html`, inside `#payment-panel-momo`, replace:

```html
                  <button class="btn-checkout-submit" id="checkout-submit-momo-btn" style="margin-top: 24px;">
                    Valider le paiement Mobile Money
                  </button>
                </div>

                <!-- Form Panel 2: Credit Card (Interactive Card Flip) -->
```

with:

```html
                  <label class="save-info-checkbox-row">
                    <input type="checkbox" id="save-info-momo-checkbox" checked>
                    <span>
                      <strong>Enregistrer mes informations pour un paiement en 1 clic</strong>
                      Payez plus vite la prochaine fois sur Shammah et partout où ce lien est accepté.
                    </span>
                  </label>

                  <button class="btn-checkout-submit" id="checkout-submit-momo-btn" style="margin-top: 24px;">
                    Valider le paiement Mobile Money
                  </button>
                </div>

                <!-- Form Panel 2: Credit Card (Interactive Card Flip) -->
```

- [ ] **Step 5: Add the same checkbox to the Card panel**

In `index.html`, inside `#payment-panel-card`, replace:

```html
                  <button class="btn-checkout-submit" id="checkout-submit-card-btn" style="margin-top: 24px;">
                    Confirmer le paiement par carte
                  </button>
                </div>
              </div>
            </div>
```

with:

```html
                  <label class="save-info-checkbox-row">
                    <input type="checkbox" id="save-info-card-checkbox" checked>
                    <span>
                      <strong>Enregistrer mes informations pour un paiement en 1 clic</strong>
                      Payez plus vite la prochaine fois sur Shammah et partout où ce lien est accepté.
                    </span>
                  </label>

                  <button class="btn-checkout-submit" id="checkout-submit-card-btn" style="margin-top: 24px;">
                    Confirmer le paiement par carte
                  </button>
                </div>
              </div>
            </div>
```

Note: this closes the same three `</div>` tags that were already there (`.payment-form-panel`, `.checkout-card`, `#checkout-step-2-content`) — only the checkbox markup is inserted before the submit button.

- [ ] **Step 6: Add the CSS**

Append to `css/shammah.css`:

```css
.save-info-checkbox-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 20px;
  padding: 14px 16px;
  border: 1px solid var(--accent-light);
  border-radius: 14px;
  cursor: pointer;
}

.save-info-checkbox-row input[type="checkbox"] {
  margin-top: 3px;
  width: 16px;
  height: 16px;
  accent-color: var(--text-primary);
  flex-shrink: 0;
}

.save-info-checkbox-row span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: var(--font-inter);
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.save-info-checkbox-row span strong {
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 700;
}
```

- [ ] **Step 7: Re-run the test and confirm it passes**

```bash
node /tmp/shammah-checkout-tests/test-task3.js
```

Expected: `first phone option text = "🇨🇮 CIV +225"`, `momoCheckboxCount = 1`, `cardCheckboxCount = 1`.

- [ ] **Step 8: Commit**

```bash
git add index.html css/shammah.css
git commit -m "$(cat <<'EOF'
Add phone country flags and a cosmetic 1-click checkout checkbox

Flag emoji on the phone country-prefix options for visual polish.
Adds a checked-by-default, purely decorative "save my info" checkbox
to both payment panels, matching the reference design — no backend,
consistent with the rest of this demo site.
EOF
)"
```

---

## Task 4: Step 3 — "Terminé" order confirmation screen

**Files:**
- Modify: `index.html` (insert `#checkout-step-3-content` panel between `#checkout-step-2-content`'s closing tag and `.checkout-left-col`'s closing tag)
- Modify: `css/shammah.css` (add `.checkout-success-*` rules)
- Modify: `js/shammah.js` (add `generateOrderNumber()` + `showOrderConfirmation()`; change the Mobile Money and card success branches; add the `checkout-continue-shopping-btn` handler)
- Test: reuse `/tmp/shammah-checkout-tests/`

**Interfaces:**
- Consumes: `setCheckoutStep(stepNumber)` from Task 1 — must already exist and already tolerate a missing `#checkout-step-3-content` (it does, via the null check added in Task 1).
- Produces: `generateOrderNumber()` (returns a string like `"SH-48213"`) and `showOrderConfirmation()` (no params, no return value) — not consumed by any later task in this plan, but this is the same order-number format already used as a placeholder in the tracking drawer (`SH-10294`), so keep the `SH-` prefix + 5 digits.

- [ ] **Step 1: Write the failing test**

Create `/tmp/shammah-checkout-tests/test-task4.js`:

```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/index.html';

async function runMomoHappyPath(page) {
  await page.goto(BASE);
  await page.waitForSelector('.product-card');
  await page.locator('.product-card .add-cart-fast-btn').first().click();
  await page.click('#desktop-cart-btn');
  await page.click('#checkout-action-btn');
  await page.click('#demo-autofill-btn');
  await page.click('#checkout-to-payment-btn');
  await page.waitForSelector('#checkout-step-2-content', { state: 'visible' });
  await page.fill('#momo-phone-number', '0700000000');
  await page.click('#checkout-submit-momo-btn');
  await page.waitForSelector('#momo-simulation-modal', { state: 'visible' });
  // The simulation takes 15s in real time; wait for the modal to close.
  await page.waitForSelector('#momo-simulation-modal', { state: 'hidden', timeout: 20000 });
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await runMomoHappyPath(page);

  const step3Visible = await page.isVisible('#checkout-step-3-content').catch(() => false);
  const checkoutStillVisible = await page.isVisible('#checkout-screen').catch(() => false);
  const orderNumberText = step3Visible ? await page.textContent('#checkout-order-number') : null;
  console.log('step3Visible =', step3Visible, '(expected true after the change)');
  console.log('checkoutStillVisible =', checkoutStillVisible, '(expected true after the change — today it redirects away)');
  console.log('orderNumberText =', orderNumberText, '(expected something like "SH-48213")');
  console.log('errors:', errors);

  await browser.close();
})();
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
node /tmp/shammah-checkout-tests/test-task4.js
```

Expected: `step3Visible = false`, `checkoutStillVisible = false` (today, the momo success path hides the checkout screen and jumps back to the shop — there is no step 3 yet).

- [ ] **Step 3: Add the Step 3 HTML panel**

In `index.html`, find the end of `#checkout-step-2-content` — it currently ends with (the `payment-panel-card`'s closing `</div>`, then `.checkout-card`'s closing `</div>`, then `#checkout-step-2-content`'s closing `</div>`, then `.checkout-left-col`'s closing `</div>`):

```html
                  <button class="btn-checkout-submit" id="checkout-submit-card-btn" style="margin-top: 24px;">
                    Confirmer le paiement par carte
                  </button>
                </div>
              </div>
            </div>
          </div>
```

Replace it with (inserting the new step-3 panel as a sibling of `#checkout-step-2-content`, still inside `.checkout-left-col`):

```html
                  <button class="btn-checkout-submit" id="checkout-submit-card-btn" style="margin-top: 24px;">
                    Confirmer le paiement par carte
                  </button>
                </div>
              </div>
            </div>

            <!-- STEP 3: ORDER CONFIRMATION (Hidden initially) -->
            <div class="checkout-step-content" id="checkout-step-3-content" style="display: none;">
              <div class="checkout-card checkout-success-card">
                <div class="checkout-success-icon">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3>Commande confirmée !</h3>
                <p class="checkout-success-order-number">Commande <strong id="checkout-order-number">--</strong></p>
                <p class="checkout-success-message">Merci pour votre achat chez Shammah. Un e-mail de confirmation vous a été envoyé avec tous les détails de votre commande.</p>
                <button class="btn-checkout-submit" id="checkout-continue-shopping-btn">Continuer mes achats</button>
              </div>
            </div>
          </div>
```

The last two `</div>` lines are unchanged — they still close `#checkout-step-2-content` and `.checkout-left-col` respectively, exactly as before. Only the new `<!-- STEP 3 -->` block is inserted between the `#checkout-step-2-content` close and the `.checkout-left-col` close, making the step-3 panel a sibling of steps 1 and 2 inside the same column.

- [ ] **Step 4: Add the CSS**

Append to `css/shammah.css`:

```css
.checkout-success-card {
  text-align: center;
  padding: 48px 24px;
}

.checkout-success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #4caf50;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px auto;
}

.checkout-success-icon svg {
  width: 30px;
  height: 30px;
}

.checkout-success-card h3 {
  margin-bottom: 8px;
}

.checkout-success-order-number {
  font-family: var(--font-inter);
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.checkout-success-order-number strong {
  color: var(--text-primary);
}

.checkout-success-message {
  font-family: var(--font-inter);
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 380px;
  margin: 0 auto 28px auto;
}
```

- [ ] **Step 5: Add `generateOrderNumber()` and `showOrderConfirmation()`**

In `js/shammah.js`, immediately before `function setCheckoutStep(stepNumber) {` (added in Task 1), add:

```javascript
function generateOrderNumber() {
  return "SH-" + Math.floor(10000 + Math.random() * 90000);
}

function showOrderConfirmation() {
  const orderNumberEl = document.getElementById("checkout-order-number");
  if (orderNumberEl) orderNumberEl.textContent = generateOrderNumber();
  setCheckoutStep(3);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
```

- [ ] **Step 6: Redirect the Mobile Money success path to Step 3**

In `js/shammah.js`, inside the `submitMomoBtn` click handler, replace:

```javascript
      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (momoSimModal) momoSimModal.style.display = "none";
        
        // Back to Boutique
        const shopScreen = document.getElementById("shop-screen");
        const desktopHero = document.getElementById("desktop-hero");
        const checkoutScreen = document.getElementById("checkout-screen");
        
        if (shopScreen) shopScreen.style.display = "block";
        if (desktopHero) desktopHero.style.display = isDesktop() ? "block" : "none";
        if (checkoutScreen) checkoutScreen.style.display = "none";
        
        showToast("Félicitations ! Votre commande Shammah a bien été enregistrée.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
```

with:

```javascript
      if (secondsLeft <= 0) {
        clearInterval(interval);
        if (momoSimModal) momoSimModal.style.display = "none";
        showOrderConfirmation();
      }
```

- [ ] **Step 7: Redirect the card payment success path to Step 3**

In `js/shammah.js`, inside the `submitCardBtn` click handler's `setTimeout` callback, replace the tail:

```javascript
      updateCartBadges();
      
      const shopScreen = document.getElementById("shop-screen");
      const desktopHero = document.getElementById("desktop-hero");
      const checkoutScreen = document.getElementById("checkout-screen");
      
      if (shopScreen) shopScreen.style.display = "block";
      if (desktopHero) desktopHero.style.display = isDesktop() ? "block" : "none";
      if (checkoutScreen) checkoutScreen.style.display = "none";
      
      showToast("Félicitations ! Votre commande Shammah a bien été enregistrée.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2000);
```

with:

```javascript
      updateCartBadges();
      showOrderConfirmation();
    }, 2000);
```

- [ ] **Step 8: Add the "Continuer mes achats" handler**

In `js/shammah.js`, right after the `checkoutBackBtn` block (search for `const checkoutBackBtn = document.getElementById("checkout-back-btn");`), add:

```javascript
const checkoutContinueShoppingBtn = document.getElementById("checkout-continue-shopping-btn");
if (checkoutContinueShoppingBtn) {
  checkoutContinueShoppingBtn.addEventListener("click", () => {
    const shopScreen = document.getElementById("shop-screen");
    const desktopHero = document.getElementById("desktop-hero");
    const checkoutScreen = document.getElementById("checkout-screen");

    if (shopScreen) shopScreen.style.display = "block";
    if (desktopHero) desktopHero.style.display = isDesktop() ? "block" : "none";
    if (checkoutScreen) checkoutScreen.style.display = "none";

    setCheckoutStep(1); // reset for the next visit
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
```

- [ ] **Step 9: Re-run the test and confirm it passes**

```bash
node /tmp/shammah-checkout-tests/test-task4.js
```

Expected: `step3Visible = true`, `checkoutStillVisible = true`, `orderNumberText` matches `/^SH-\d{5}$/`, `errors: []`.

Also manually verify: click `#checkout-continue-shopping-btn` and confirm the shop screen reappears and the checkout screen hides. Then repeat a card-payment purchase (fill card fields, submit, wait 2s) and confirm it also lands on step 3 with a (different) order number.

- [ ] **Step 10: Commit**

```bash
git add index.html css/shammah.css js/shammah.js
git commit -m "$(cat <<'EOF'
Add a real order-confirmation step to checkout

Both the Mobile Money and card payment simulations now land on a
new "Terminé" step (success icon, generated order number, thank-you
message, "Continuer mes achats" button) instead of an immediate
toast + redirect. Cart-clearing and form-reset behavior is unchanged.
EOF
)"
```

---

## Task 5: Order summary card restyle

**Files:**
- Modify: `css/shammah.css:1284-1297` (`.checkout-cart-item`)
- Modify: `js/shammah.js:1339` (the item subtitle template in `renderCheckoutSummary()`)
- Test: reuse `/tmp/shammah-checkout-tests/`

**Interfaces:** none.

- [ ] **Step 1: Write the failing test**

Create `/tmp/shammah-checkout-tests/test-task5.js`:

```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE);
  await page.waitForSelector('.product-card');
  await page.locator('.product-card .add-cart-fast-btn').first().click();
  await page.click('#desktop-cart-btn');
  await page.click('#checkout-action-btn');
  await page.waitForSelector('#checkout-items-list .checkout-cart-item');

  const subtitle = await page.textContent('.checkout-cart-item .checkout-item-subtitle');
  const hasBorder = await page.locator('.checkout-cart-item').first().evaluate(
    el => getComputedStyle(el).borderStyle !== 'none' && getComputedStyle(el).borderWidth !== '0px'
  );
  console.log('subtitle =', JSON.stringify(subtitle), '(expected to start with "Taille:" after the change)');
  console.log('hasBorder =', hasBorder, '(expected true after the change — today the divider is border-bottom only, not a full border)');

  await browser.close();
})();
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
node /tmp/shammah-checkout-tests/test-task5.js
```

Expected: `subtitle` does NOT start with `"Taille:"` (today it's `"<variant name> | <size>"`), `hasBorder = false` (today it's a bottom-only divider).

- [ ] **Step 3: Restyle `.checkout-cart-item` as a bordered box**

In `css/shammah.css`, replace:

```css
.checkout-cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--bg-primary);
}

.checkout-cart-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
```

with:

```css
.checkout-cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--accent-light);
  border-radius: 16px;
  margin-bottom: 12px;
}

.checkout-cart-item:last-child {
  margin-bottom: 0;
}
```

- [ ] **Step 4: Fix the subtitle order for consistency with the cart drawer**

In `js/shammah.js`, inside `renderCheckoutSummary()`, replace:

```javascript
        <p class="checkout-item-subtitle">${item.variant.name} | ${item.size}</p>
```

with:

```javascript
        <p class="checkout-item-subtitle">Taille: ${item.size} | ${item.variant.name}</p>
```

(This matches the exact format already used by the cart drawer's own `renderCart()`, which renders `Taille: ${item.size} | ${item.variant.name}`.)

- [ ] **Step 5: Re-run the test and confirm it passes**

```bash
node /tmp/shammah-checkout-tests/test-task5.js
```

Expected: `subtitle` starts with `"Taille:"`, `hasBorder = true`.

- [ ] **Step 6: Commit**

```bash
git add css/shammah.css js/shammah.js
git commit -m "$(cat <<'EOF'
Restyle checkout order summary rows as bordered product cards

Each cart line in the checkout right-column summary now sits in its
own rounded bordered box (matching the reference "Product Review"
card) instead of a plain bottom-divider list. Subtitle format is
also aligned with the cart drawer's existing "Taille: X | Color" order.
EOF
)"
```

---

## Task 6: Checkout header wordmark

**Files:**
- Modify: `index.html:218-220` (top of `.checkout-wrapper`, right before `.checkout-back-header`)
- Modify: `css/shammah.css` (add `.checkout-logo`)
- Test: reuse `/tmp/shammah-checkout-tests/`

**Interfaces:** none.

- [ ] **Step 1: Write the failing test**

Create `/tmp/shammah-checkout-tests/test-task6.js`:

```javascript
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE);
  await page.waitForSelector('.product-card');
  await page.locator('.product-card .add-cart-fast-btn').first().click();
  await page.click('#desktop-cart-btn');
  await page.click('#checkout-action-btn');
  await page.waitForSelector('#checkout-screen', { state: 'visible' });

  const logoVisible = await page.isVisible('.checkout-wrapper .checkout-logo').catch(() => false);
  console.log('logoVisible =', logoVisible, '(expected true after the change)');

  await browser.close();
})();
```

- [ ] **Step 2: Run it and confirm it fails**

```bash
node /tmp/shammah-checkout-tests/test-task6.js
```

Expected: `logoVisible = false` (`.checkout-logo` doesn't exist yet).

- [ ] **Step 3: Add the wordmark**

In `index.html`, replace:

```html
      <div class="checkout-wrapper">
        <!-- Back navigation header -->
        <div class="checkout-back-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
```

with:

```html
      <div class="checkout-wrapper">
        <span class="checkout-logo">SHAMMAH</span>
        <!-- Back navigation header -->
        <div class="checkout-back-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
```

- [ ] **Step 4: Add the CSS**

Append to `css/shammah.css`:

```css
.checkout-logo {
  display: block;
  font-family: var(--font-inter);
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 2.5px;
  color: var(--text-primary);
  margin-bottom: 16px;
}
```

- [ ] **Step 5: Re-run the test and confirm it passes**

```bash
node /tmp/shammah-checkout-tests/test-task6.js
```

Expected: `logoVisible = true`.

- [ ] **Step 6: Commit**

```bash
git add index.html css/shammah.css
git commit -m "$(cat <<'EOF'
Add SHAMMAH wordmark to the checkout screen header

Small brand mark above the back-to-shop button, matching the
top-left logo placement in the reference checkout design.
EOF
)"
```

---

## Final full-flow regression check

After all 6 tasks are done, run one end-to-end script covering both payment methods and both viewports, to catch any interaction between tasks:

```javascript
// /tmp/shammah-checkout-tests/test-final.js
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8811/index.html';

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  let ok = true;
  const log = (label, cond) => { console.log((cond ? 'PASS' : 'FAIL') + ' - ' + label); if (!cond) ok = false; };

  for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    page.on('console', msg => { if (msg.type() === 'error') errors.push('[' + viewport.width + '] ' + msg.text()); });
    page.on('pageerror', err => errors.push('[' + viewport.width + '] ' + err.message));

    await page.goto(BASE);
    await page.waitForSelector('.product-card');
    await page.locator('.product-card .add-cart-fast-btn').first().click();
    await (viewport.width > 768 ? page.click('#desktop-cart-btn') : page.click('#open-cart-btn'));
    await page.click('#checkout-action-btn');
    await page.click('#demo-autofill-btn');
    await page.click('#checkout-to-payment-btn');
    await page.waitForSelector('#checkout-step-2-content', { state: 'visible' });
    log(`[${viewport.width}] step 2 shows the bordered payment-method cards`, await page.locator('.payment-method-card').count() === 2);

    await page.fill('#momo-phone-number', '0700000000');
    await page.click('#checkout-submit-momo-btn');
    await page.waitForSelector('#momo-simulation-modal', { state: 'hidden', timeout: 20000 });
    log(`[${viewport.width}] momo payment lands on step 3 with an order number`, /^SH-\d{5}$/.test(await page.textContent('#checkout-order-number')));

    await page.click('#checkout-continue-shopping-btn');
    log(`[${viewport.width}] "Continuer mes achats" returns to the shop`, await page.isVisible('#shop-screen'));

    await ctx.close();
  }

  console.log('\nerrors:', errors.length, errors);
  console.log(ok && errors.length === 0 ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED');
  process.exit(ok && errors.length === 0 ? 0 : 1);
})();
```

```bash
node /tmp/shammah-checkout-tests/test-final.js
```

Expected: all `PASS`, `errors: 0 []`.

When done, stop the background static server:

```bash
pid=$(netstat -ano 2>/dev/null | grep ':8811' | grep LISTENING | awk '{print $5}' | head -1)
[ -n "$pid" ] && taskkill //F //PID "$pid"
```
