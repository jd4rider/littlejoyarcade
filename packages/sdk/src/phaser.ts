import type { Arcade } from './client'
import type { Json } from './types'

/** The two Phaser scene members the bridge needs — no Phaser import required. */
export interface PhaserSceneLike {
  events: {
    once(event: string, callback: () => void): unknown
    on(event: string, callback: () => void): unknown
    off?(event: string, callback: () => void): unknown
  }
}

/**
 * Saves when a scene shuts down, and re-syncs when the browser comes back
 * online. Games keep their own save shape; the bridge only decides *when*.
 */
export function bindPhaserProgress<T extends Json>(scene: PhaserSceneLike, arcade: Arcade, getData: () => T) {
  const save = () => {
    void arcade.progress.save(getData())
  }

  scene.events.once('shutdown', save)
  scene.events.once('destroy', save)

  if (typeof window !== 'undefined') {
    const resync = () => void arcade.progress.sync()
    window.addEventListener('online', resync)
    scene.events.once('shutdown', () => window.removeEventListener('online', resync))
  }

  return { save, load: () => arcade.progress.load<T>() }
}
