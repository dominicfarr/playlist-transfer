---
status: accepted
---

# DNS for domfarr.com lives in Route 53; each S3/CloudFront subdomain app is a CloudFormation stack

Earlier subdomain apps (`organism`, `care`, `coconut`) were set up by hand, with DNS records typed into GoDaddy. That rules out a pipeline: GoDaddy's API eligibility is uncertain, and it sits outside CloudFormation, so certificate validation would have to be scripted around the stack. We move authoritative DNS for the whole of `domfarr.com` to a single Route 53 hosted zone. GoDaddy remains the registrar only. Each app's CloudFormation stack, deployed from GitHub Actions through OIDC, owns its own S3 bucket, ACM certificate (DNS-validated automatically against the zone) and CloudFront distribution, and adds its own records to the shared zone, found by its zone ID. This is the pattern for all future subdomain apps.

## Considered Options

- **Delegate only each app's subdomain to its own Route 53 zone**: no migration needed, but every new app costs a manual NS change at GoDaddy plus a zone at about $0.50 a month.
- **Automate GoDaddy's DNS API from the pipeline**: a 403 is possible, and it doesn't fit inside CloudFormation.

## Consequences

- Migration: recreate every GoDaddy record in Route 53 before switching nameservers. That covers the GitHub Pages apex A records, `www`, the existing app CNAMEs and their ACM validation CNAMEs (otherwise those certificates fail to renew), ImprovMX MX + SPF, and the GitHub Pages verification TXT. Drop the GoDaddy-specific `_domainconnect` record. DNSSEC is not enabled, so switching nameservers is safe.
