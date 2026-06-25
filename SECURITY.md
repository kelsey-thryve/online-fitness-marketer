# Security Policy

We take the security of Trainer Launch and our users' data seriously. If you discover a security vulnerability, please report it to us privately so we can fix it before it's publicly disclosed.

## Reporting a Vulnerability

**Preferred — GitHub Private Vulnerability Reporting:**
[Open a new report](https://github.com/kelsey-thryve/online-fitness-marketer/security/advisories/new)

**Email:** `security@trainerlaunch.app`

Please include in your report:

- A description of the vulnerability and its potential impact
- Steps to reproduce (proof-of-concept, screenshots, or video)
- The affected URL, endpoint, or component
- Any suggested mitigation (optional)
- Whether you'd like to be publicly credited if we publish an advisory

## Response SLA

We aim to respond as follows:

| Severity | Acknowledgement | Triage | Fix target |
|---|---|---|---|
| Critical | 1 business day | 3 days | 30 days |
| High | 1 business day | 7 days | 30 days |
| Medium | 2 business days | 14 days | 90 days |
| Low | 5 business days | 30 days | Best effort |

We'll keep you updated as we investigate and remediate, and we'll let you know before we publish any related security advisory.

## Scope

**In scope:**

- `trainerlaunch.app` and all subdomains
- This GitHub repository (`kelsey-thryve/online-fitness-marketer`)
- Trainer Launch's Anthropic Managed Agents vault and Supabase project — only when accessed via a test account you have legitimately registered

**Out of scope:**

- Third-party services we depend on (Supabase, Netlify, Anthropic, Resend, Klaviyo, Meta, Google Ads, Duda, Canva) — please report those to the respective vendors
- Social engineering of Thryve Growth staff, contractors, or end users
- Physical security attacks
- Denial-of-service or volumetric attacks (we'll consider amplification vectors against our own infrastructure separately)
- Reports generated solely by automated scanners with no proof of exploitability
- Vulnerabilities in upstream software we use but did not author (please report those to the upstream maintainer)
- Missing security headers without a demonstrated exploit
- Self-XSS or reports requiring full attacker access to a victim's device

## Safe Harbor

We support good-faith security research. If you:

- Make a good-faith effort to avoid privacy violations, data destruction, and service disruption
- Test only against accounts you own or have explicit, written permission to test
- Do not access, modify, retain, or share other users' data
- Give us a reasonable opportunity to remediate before public disclosure (typically 90 days)
- Comply with all applicable laws

…then we will:

- Consider your research authorized under our Terms of Service
- Not pursue or support legal action against you
- Acknowledge your contribution in any published security advisory, if you'd like

## Bug Bounty

Trainer Launch does not currently offer paid bounties. We deeply appreciate responsible disclosures and will publicly credit reporters (with their permission) in our published advisories.

## Operated By

Trainer Launch is a product of Thryve Growth. Security correspondence will come from `security@trainerlaunch.app`.
