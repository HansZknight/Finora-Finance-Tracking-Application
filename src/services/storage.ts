export const STORAGE_KEY = 'finance_tracker_pro_data'

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item) as T
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return defaultValue
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error)
  }
}

export function clearStorage(): void {
  try {
    window.localStorage.clear()
  } catch (error) {
    console.error("Error clearing localStorage:", error)
  }
}
