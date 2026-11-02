import type { StorageLike } from './types'

/**
 * The preload bridge an Electron app exposes. In the main process, keep the
 * handler narrow: read and write one JSON file inside app.getPath('userData').
 */
export interface ElectronFileBridge {
  read(key: string): string | null
  write(key: string, value: string): void
  remove?(key: string): void
}

/**
 * Adapts a context-isolated Electron preload bridge into SDK storage, so
 * desktop games can keep saves in a file instead of localStorage.
 *
 * main process (example):
 *   ipcMain.handle('arcade:read', (_e, key) => readSaveFile(key))
 *   ipcMain.handle('arcade:write', (_e, key, value) => writeSaveFile(key, value))
 */
export function createElectronStorage(bridge: ElectronFileBridge): StorageLike {
  return {
    getItem: (key) => {
      try {
        return bridge.read(key)
      } catch {
        return null
      }
    },
    setItem: (key, value) => {
      try {
        bridge.write(key, value)
      } catch {
        // disk full or permissions: the session continues in memory
      }
    },
    removeItem: (key) => {
      try {
        bridge.remove?.(key)
      } catch {
        // ignore
      }
    },
  }
}
