import { useCallback, useEffect, useState } from 'react'

export const TIP_URL = 'https://www.buymeacoffee.com/jd4rider'

const DISMISS_KEY = 'lja:tip-snoozed:v2'
const LEGACY_KEY = 'lja:tip-dismissed:v1'
const DAY_MS = 24 * 60 * 60 * 1000
/** Closing the pill buys a quiet week; then it is allowed to ask once more. */
const SNOOZE_MS = 7 * DAY_MS
/** Let the page settle before the nudge fades in. */
const REVEAL_DELAY_MS = 4000

function snoozedUntil(): number {
  try {
    const raw = localStorage.getItem(DISMISS_KEY)
    if (raw) {
      const at = Number.parseInt(raw, 10)
      if (Number.isFinite(at)) return at + SNOOZE_MS
    }
    if (localStorage.getItem(LEGACY_KEY) === '1') {
      // Players who closed the old once-ever pill start their week now rather
      // than having it pop straight back.
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
      localStorage.removeItem(LEGACY_KEY)
      return Date.now() + SNOOZE_MS
    }
  } catch {
    // Storage blocked: fall through and let the nudge show.
  }
  return 0
}

/**
 * The coffee nudge. It survives a dismissal for a week and then returns, so it
 * is noticed without nagging, and it fades in a few seconds after the page.
 */
export function useTipJar(): { visible: boolean; revealed: boolean; dismiss: () => void } {
  // Start hidden so the pill never flashes for someone still inside their week.
  const [dismissed, setDismissed] = useState(true)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (Date.now() < snoozedUntil()) return
    setDismissed(false)
    const timer = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setRevealed(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // ignore
    }
  }, [])

  return { visible: !dismissed, revealed, dismiss }
}

export function TipJarBanner({ revealed, onDismiss }: { revealed: boolean; onDismiss: () => void }) {
  return (
    <div
      role="complementary"
      aria-label="Support Little Joy Arcade"
      aria-hidden={revealed ? undefined : true}
      className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-3"
    >
      <div
        className={`flex w-full max-w-xl items-center gap-2.5 rounded-2xl border border-joy-amber/30 bg-ink-900/95 py-2.5 pl-2.5 pr-1.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl transition duration-500 sm:gap-3 sm:pl-3 ${
          revealed ? 'pointer-events-auto translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-joy-amber to-joy-coral text-lg"
        >
          ☕
        </span>
        <p className="min-w-0 flex-1 text-[0.78rem] leading-snug text-white/75 sm:text-sm">
          <span className="font-semibold text-cream">Free, and ad-free while you play.</span>{' '}
          <span className="hidden sm:inline">If the arcade earns a few minutes of your evening, keep it brewing.</span>
          <span className="sm:hidden">Keep it brewing?</span>
        </p>
        <a
          href={TIP_URL}
          target="_blank"
          rel="noreferrer"
          tabIndex={revealed ? undefined : -1}
          className="btn btn-primary shrink-0 px-3 py-2 text-xs"
        >
          Buy a coffee
        </a>
        <button
          type="button"
          onClick={onDismiss}
          tabIndex={revealed ? undefined : -1}
          aria-label="Dismiss the support message for a week"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-cream"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  )
}
