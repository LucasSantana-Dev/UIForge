# Siza Google Ads Micro-Pilot Day 1 Ops

## Pre-publish

1. Run local gates:
   - `npm run ads:google:prepublish`
2. Run one UTM-tagged signup test:
   - `https://siza.forgespace.co/?utm_source=google&utm_medium=cpc&utm_campaign=siza_br_en_leadtest_v1`
3. In GA4 DebugView, verify `lead_signup_success` fired.
4. In Google Ads, verify imported GA4 conversion `lead_signup_success` is `Primary`.

## Campaign setup

1. Create Search campaign: `siza_br_en_leadtest_v1`.
2. Goal: `Leads`.
3. Networks:
   - Enable: Google Search
   - Disable: Search Partners
   - Disable: Display Network expansion
4. Targeting:
   - Location: Brazil
   - Language: English
5. Budget and bid:
   - Daily budget: `$1`
   - Bidding: Maximize Clicks, CPC cap `$0.80`
6. Create one ad group: `high_intent`.
7. Import keywords from `keywords.csv`.
8. Import negatives from `negative-keywords.csv`.
9. Create one Responsive Search Ad from `rsa.json`.

## Spend control

1. Create automated rule: pause campaign at cumulative spend `$10`.
2. Review checkpoints at spend `$3`, `$6`, `$8`:
   - Search Terms report relevance
   - Add negative keywords
   - Pause keywords with `2+ clicks` and no engagement signal

## Go/No-Go

- Continue if:
  - At least 1 paid signup, or
  - CTR `>= 3%` with relevant search terms
- Pause if:
  - CTR `< 1.5%` by `$6`, or
  - no meaningful intent by `$6`, or
  - conversion tracking is not receiving
