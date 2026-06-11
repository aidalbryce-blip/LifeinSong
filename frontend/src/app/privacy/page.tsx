export default function PrivacyPage() {
  return (
    <div className="shell" style={{ maxWidth: 720 }}>
      <section style={{ padding: '48px 0 80px' }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Legal</div>
        <h1 className="display" style={{ fontSize: 'clamp(32px, 4vw, 48px)', margin: '0 0 12px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--ink-400)', fontSize: 14, margin: '0 0 48px' }}>
          Last updated: June 2026 — This is a working draft. A complete policy will be published before public launch.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
              What we collect
            </h2>
            <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              When you place an order, we collect your name, email address, occasion details, and any voice recordings or written notes you provide as part of your brief. We use this information solely to write and deliver your song.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
              Voice recordings
            </h2>
            <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              Voice recordings are retained for 90 days after your song is delivered, then permanently deleted. If an order is never fulfilled, recordings are deleted 90 days after submission.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
              How we use your information
            </h2>
            <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              Your information is used only to fulfil your order. We do not sell, share, or use your personal data for advertising. Your email is used to send your delivery link and, if applicable, a payment link.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-50)', margin: '0 0 10px', fontWeight: 400 }}>
              Contact
            </h2>
            <p style={{ color: 'var(--ink-400)', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              Questions about your data?{' '}
              <a href="mailto:hello@lifeinsong.com" style={{ color: 'var(--accent-500)', textDecoration: 'none' }}>
                hello@lifeinsong.com
              </a>
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
