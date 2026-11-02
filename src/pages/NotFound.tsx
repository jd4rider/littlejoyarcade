import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="text-5xl" aria-hidden="true">
        🎈
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-cream">That game floated away</h1>
      <p className="mt-2 text-white/55">The page or game you were looking for is not here.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/games" className="btn btn-primary">
          Browse the shelf
        </Link>
        <Link to="/" className="btn btn-ghost">
          Go home
        </Link>
      </div>
    </div>
  )
}
