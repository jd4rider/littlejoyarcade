import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../lib/auth'
import {
  FEEDBACK_MAX_COMMENT,
  loadFeedbackSummaries,
  readLocalFeedback,
  submitFeedback,
  type FeedbackSummary,
} from '../lib/feedback'

const STAR_LABELS = ['Not for me', 'It was okay', 'Good fun', 'Really good', 'A little joy']

/**
 * One form per game, rendered on the game's page. Ratings are public and shown
 * as an average; written notes go to the owner only, so people can be blunt.
 */
export default function FeedbackForm({
  gameId,
  gameName,
  gameVersion,
}: {
  gameId: string
  gameName: string
  gameVersion: string
}) {
  const { user, displayName } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [nameEdited, setNameEdited] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [summary, setSummary] = useState<FeedbackSummary | null>(null)

  useEffect(() => {
    const saved = readLocalFeedback(gameId)
    setRating(saved?.rating ?? 0)
    setComment(saved?.comment ?? '')
    setSent(saved !== null)
    setError(null)
  }, [gameId])

  useEffect(() => {
    if (nameEdited) return
    setName(displayName && displayName !== 'Guest' ? displayName : '')
  }, [displayName, nameEdited])

  useEffect(() => {
    let alive = true
    void loadFeedbackSummaries().then((all) => {
      if (alive) setSummary(all.get(gameId) ?? null)
    })
    return () => {
      alive = false
    }
  }, [gameId])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!rating) {
      setError('Pick a star rating first.')
      return
    }
    setSending(true)
    setError(null)
    const result = await submitFeedback({
      gameId,
      rating,
      comment,
      name,
      version: gameVersion,
      userId: user?.id ?? null,
    })
    setSending(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setSent(true)
    const all = await loadFeedbackSummaries()
    setSummary(all.get(gameId) ?? null)
  }

  return (
    <section id="feedback" className="card p-5 sm:p-6" aria-labelledby="feedback-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="feedback-heading" className="text-xl font-bold text-cream">
            Rate {gameName}
          </h2>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-white/55">
            One tap tells us how it plays. The score is public; written notes go straight to the developer and are
            never shown to other players.
          </p>
        </div>
        {summary && summary.ratings > 0 ? (
          <p className="shrink-0 rounded-full border border-white/14 bg-white/5 px-3 py-1.5 text-sm text-cream">
            <span aria-hidden="true" className="text-joy-amber">
              ★
            </span>{' '}
            {summary.average.toFixed(1)}
            <span className="text-white/45">
              {' '}
              · {summary.ratings} rating{summary.ratings === 1 ? '' : 's'}
            </span>
          </p>
        ) : (
          <p className="shrink-0 text-xs text-white/40">No ratings yet — be the first.</p>
        )}
      </div>

      <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
        <fieldset>
          <legend className="text-sm font-semibold text-cream">Your rating</legend>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="cursor-pointer rounded-lg p-0.5">
                <input
                  type="radio"
                  name={`rating-${gameId}`}
                  value={star}
                  checked={rating === star}
                  onChange={() => {
                    setRating(star)
                    setError(null)
                  }}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`block rounded text-3xl leading-none transition peer-focus-visible:ring-2 peer-focus-visible:ring-joy-amber peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-ink-900 ${
                    star <= rating ? 'text-joy-amber' : 'text-white/25 hover:text-white/50'
                  }`}
                >
                  ★
                </span>
                <span className="sr-only">
                  {star} out of 5 — {STAR_LABELS[star - 1]}
                </span>
              </label>
            ))}
            <span className="ml-2 text-sm text-white/55" aria-hidden="true">
              {rating ? STAR_LABELS[rating - 1] : 'Pick a star'}
            </span>
          </div>
        </fieldset>

        <label className="block">
          <span className="block text-sm font-semibold text-cream">What would make it better?</span>
          <span className="block text-xs text-white/40">
            Optional. Blunt beats polite — bugs, boring bits, confusing levels, all useful.
          </span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value.slice(0, FEEDBACK_MAX_COMMENT))}
            rows={4}
            maxLength={FEEDBACK_MAX_COMMENT}
            placeholder="The controls fought me on a phone… / Levels 20–30 felt samey… / Loved the sound, wanted more of it…"
            className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-900/70 px-3 py-2.5 text-sm leading-relaxed text-cream placeholder:text-white/25 focus:border-joy-amber/60 focus:outline-none"
          />
          <span className="mt-1 block text-right text-[0.7rem] text-white/30">
            {comment.length}/{FEEDBACK_MAX_COMMENT}
          </span>
        </label>

        <label className="block sm:max-w-xs">
          <span className="block text-sm font-semibold text-cream">Name</span>
          <input
            value={name}
            onChange={(event) => {
              setNameEdited(true)
              setName(event.target.value.slice(0, 32))
            }}
            maxLength={32}
            placeholder="Optional"
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink-900/70 px-3 py-2 text-sm text-cream placeholder:text-white/25 focus:border-joy-amber/60 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={sending || rating === 0} className="btn btn-primary px-5 py-2.5 text-sm disabled:opacity-40">
            {sending ? 'Sending…' : sent ? 'Update feedback' : 'Send feedback'}
          </button>
          <p className="text-xs text-white/35">
            {user ? `Sent as ${displayName}.` : 'No account needed.'}
          </p>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-joy-coral/40 bg-joy-coral/10 px-3 py-2 text-sm text-joy-coral">
            {error}
          </p>
        ) : null}

        <p role="status" aria-live="polite" className="min-h-5 text-sm text-joy-mint">
          {sent && !error ? 'Thank you — that is in the inbox. You can change it any time.' : ''}
        </p>
      </form>
    </section>
  )
}
