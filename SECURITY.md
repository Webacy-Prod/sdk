# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.3.x   | Yes                |
| < 1.3   | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability in the Webacy SDK, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email **security@webacy.com** with:

- A description of the vulnerability
- Steps to reproduce the issue
- The affected package(s) and version(s)
- Any potential impact assessment

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
- **Assessment**: We will investigate and provide an initial assessment within 5 business days.
- **Resolution**: We aim to release a fix within 30 days of confirming a vulnerability.
- **Disclosure**: We will coordinate with you on public disclosure timing.

## Scope

This security policy covers the Webacy SDK packages:

- `@webacy-xyz/sdk`
- `@webacy-xyz/sdk-core`
- `@webacy-xyz/sdk-threat`
- `@webacy-xyz/sdk-trading`

For vulnerabilities in the Webacy API itself (api.webacy.com), please contact security@webacy.com directly.

## Best Practices

When using the SDK:

- **Never hardcode API keys** in your source code. Use environment variables.
- **Keep the SDK updated** to the latest version for security patches.
- **Review dependencies** regularly with `npm audit` or `pnpm audit`.
