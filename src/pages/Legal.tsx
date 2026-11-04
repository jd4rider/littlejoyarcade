import { Link } from 'react-router-dom'

type Kind = 'privacy' | 'terms' | 'support'

const CONTENT: Record<Kind, { title: string; intro: string; sections: { heading: string; body: string[] }[] }> = {
  privacy: {
    title: 'Privacy',
    intro:
      'The short version: games work without an account, progress stays on your device unless you sign in, and we do not sell data.',
    sections: [
      {
        heading: 'What we store without an account',
        body: [
          'Game progress, your guest display name and a list of games you have opened are stored in your browser’s local storage. None of it leaves your device.',
          'You can export or delete all of it from My arcade at any time.',
        ],
      },
      {
        heading: 'What we store with an account',
        body: [
          'If you sign in, we store your email address, a display name, and the progress and achievements your games send to the arcade backend. Authentication is handled by Supabase; we never store passwords ourselves.',
          'Session identifiers are kept in secure, http-only cookies where the provider supports it, and access tokens stay in memory or provider-managed storage — never in URL query strings.',
        ],
      },
      {
        heading: 'Analytics and advertising',
        body: [
          'Product analytics are limited to privacy-friendly, aggregate events such as “a level was completed”. No advertising identifiers, fingerprinting or cross-site tracking are used.',
          'If ads are enabled on a page, they are served through Google AdSense with a consent prompt where required, and never inside active gameplay. Players with an ad-free entitlement see no ads.',
        ],
      },
      {
        heading: 'Children',
        body: [
          'Little Joy Arcade is family-friendly, but accounts are intended for users aged 13 and over. We do not knowingly collect personal information from children. If you believe a child has created an account, contact support and we will remove it.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can request a copy or deletion of your account data through the support page. Local data can be exported or erased instantly in My arcade.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    intro: 'Plain-language terms for playing games on Little Joy Arcade.',
    sections: [
      {
        heading: 'Playing the games',
        body: [
          'Games are provided free of charge for personal, non-commercial entertainment. You may not resell, redistribute or repackage them as your own.',
          'Source code for each game is available on GitHub under the licence stated in its repository.',
        ],
      },
      {
        heading: 'Accounts',
        body: [
          'You are responsible for activity on your account and for keeping access to your email secure. Do not share accounts or attempt to access another player’s data.',
        ],
      },
      {
        heading: 'Purchases',
        body: [
          'Paid products are one-time purchases that grant an entitlement such as ad-free play. Purchases are verified server-side; a browser redirect alone is never treated as payment.',
          'Checkout is disabled until payment processing and tax handling are configured. Nothing on the site can charge you today.',
        ],
      },
      {
        heading: 'Availability',
        body: [
          'Games and the arcade are provided “as is”, without warranty. Features may change, and a game may be marked as coming soon or retired. Progress is preserved on your device wherever possible.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Do not attempt to break, overload, scrape or reverse-engineer the service in ways that affect other players. Security research is welcome — please report it privately first.',
        ],
      },
    ],
  },
  support: {
    title: 'Support',
    intro: 'Something not loading, a save that vanished, an accessibility problem? Start here.',
    sections: [
      {
        heading: 'Quick fixes',
        body: [
          'If a game shows a blank frame, use “Open in new tab” in the play bar — some browsers block embedded pages.',
          'If progress looks missing, check that you are on the same browser profile and that private browsing is off; private windows discard local saves when they close.',
          'On a phone, rotate to landscape for games with wide boards, and use the browser’s full-screen control.',
        ],
      },
      {
        heading: 'Report a problem',
        body: [
          'Open an issue on the game’s GitHub repository, or on the arcade repository for anything about the site itself. Include the game name, your browser, and what you expected to happen.',
        ],
      },
      {
        heading: 'Account and data requests',
        body: [
          'For account deletion or a copy of your cloud data, contact the owner through the GitHub profile linked in the footer. Local data can be exported or erased yourself from My arcade.',
        ],
      },
    ],
  },
}

export default function Legal({ kind }: { kind: Kind }) {
  const content = CONTENT[kind]
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-cream sm:text-4xl">{content.title}</h1>
      <p className="mt-2 text-white/60">{content.intro}</p>
      <div className="mt-8 space-y-6">
        {content.sections.map((section) => (
          <section key={section.heading} className="card p-5">
            <h2 className="text-lg font-bold text-cream">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-2 text-sm leading-relaxed text-white/60">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      {kind === 'support' ? (
        <section
          aria-labelledby="tip-heading"
          className="card mt-6 flex flex-col gap-5 p-5 sm:flex-row sm:items-center"
        >
          <img
            src="./support-qr.png"
            alt="QR code for the Little Joy Arcade Buy Me a Coffee page"
            width={700}
            height={700}
            loading="lazy"
            decoding="async"
            className="h-40 w-40 shrink-0 self-center rounded-2xl bg-white p-2 sm:self-start"
          />
          <div className="min-w-0">
            <h2 id="tip-heading" className="text-lg font-bold text-cream">
              Buy me a coffee
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Every game here is free, has no ads inside gameplay, and asks nothing of your streak. If you would
              like to chip in for the hosting and the next game, scan the code on your phone or open the link.
            </p>
            <a
              href="https://www.buymeacoffee.com/jd4rider"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost mt-3 text-sm"
            >
              buymeacoffee.com/jd4rider ↗
            </a>
          </div>
        </section>
      ) : null}
      {kind === 'support' ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://github.com/jd4rider/littlejoyarcade/issues"
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Open an issue ↗
          </a>
          <a href="https://github.com/jd4rider" target="_blank" rel="noreferrer" className="btn btn-ghost">
            Contact the owner ↗
          </a>
        </div>
      ) : null}
      <p className="mt-8 text-xs text-white/35">
        Last updated 1 November 2026 · <Link to="/" className="underline">Back to the arcade</Link>
      </p>
    </div>
  )
}
