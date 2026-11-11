import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

/**
 * The arcade is a single-page app, so one render error used to leave the whole
 * document blank. Keep the shell usable instead: offer a reload, and clear the
 * failure as soon as the player navigates somewhere else.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('Arcade render failed', error, info.componentStack)
  }

  private reset = (): void => {
    this.setState({ failed: false })
  }

  componentDidMount(): void {
    window.addEventListener('hashchange', this.reset)
  }

  componentWillUnmount(): void {
    window.removeEventListener('hashchange', this.reset)
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center px-6 py-10 text-center">
        <div className="card max-w-md p-6">
          <h1 className="text-xl font-bold text-cream">The arcade hit a snag</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            Something went wrong while drawing this page. Your progress and saves stay on this device.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload the arcade
            </button>
            <a className="btn btn-ghost" href="#/" onClick={this.reset}>
              Back to the games
            </a>
          </div>
        </div>
      </div>
    )
  }
}
