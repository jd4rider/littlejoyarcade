import { useCallback, useEffect, useState } from 'react'

export const TIP_URL = 'https://www.buymeacoffee.com/jd4rider'

const DISMISS_KEY = 'lja:tip-dismissed:v1'

/**
 * The coffee nudge, once per player. Dismissing writes a flag so it never comes
 * back mid-session or on the next visit — a tip jar should be noticed, not nag.
 */
export function useTipJar(): { visible: boolean; dismiss: () => void } {
  // Start hidden so the pill never flashes for someone who already closed it.
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    let stored = false
    try {
      stored = localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      // Storage blocked: leave the nudge on rather than hide it forever.
    }
    setDismissed(stored)
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // ignore
    }
  }, [])

  return { visible: !dismissed, dismiss }
}

export function TipJarBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      role="complementary"
      aria-label="Support Little Joy Arcade"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-3"
    >
      <div className="pointer-events-auto flex w-full max-w-xl items-center gap-2.5 rounded-2xl border border-joy-amber/30 bg-ink-900/95 py-2.5 pl-2.5 pr-1.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:gap-3 sm:pl-3">
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
          className="btn btn-primary shrink-0 px-3 py-2 text-xs"
        >
          Buy a coffee
        </a>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss the support message"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-cream"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  )
}
