// src/utils/userKeyManager.ts

class UserKeyRotationManager {
  // Service name -> Map of userId -> rotation state
  private serviceStates: Map<string, Map<string, {
    keys: string[];
    currentIndex: number;
    exhaustedUntil: Map<string, number>;
  }>> = new Map();

  /**
   * Resolves and returns the next available API key for a service and user.
   * If user has custom keys, rotates through them.
   * If all user keys are exhausted, returns null (to trigger fallback).
   * If user has no custom keys, falls back to env-provided keys.
   */
  getKey(
    service: string,
    userId: string,
    customKeysString: string | undefined | null,
    envKeys: string[] = []
  ): string | null {
    let keys: string[] = [];

    if (customKeysString) {
      keys = customKeysString
        .trim()
        .replace(/^['"]|['"]$/g, "")
        .split(/[,;\n\r]+/)
        .map((k) => k.trim().replace(/^['"]|['"]$/g, ""))
        .filter((k) => k.length > 0);
    }

    // Fallback to environment keys if user keys not set
    if (keys.length === 0) {
      keys = envKeys;
    }

    if (keys.length === 0) {
      return null;
    }

    if (!this.serviceStates.has(service)) {
      this.serviceStates.set(service, new Map());
    }
    const userStates = this.serviceStates.get(service)!;

    let state = userStates.get(userId);
    // If the keys list changed or no state exists, initialize/reset
    if (!state || JSON.stringify(state.keys) !== JSON.stringify(keys)) {
      state = {
        keys,
        currentIndex: 0,
        exhaustedUntil: new Map()
      };
      userStates.set(userId, state);
    }

    const now = Date.now();
    // Loop through keys starting from currentIndex to find a non-exhausted key
    for (let i = 0; i < state.keys.length; i++) {
      const idx = (state.currentIndex + i) % state.keys.length;
      const key = state.keys[idx];
      const exhaustedTime = state.exhaustedUntil.get(key) || 0;
      if (now >= exhaustedTime) {
        state.currentIndex = idx;
        return key;
      }
    }

    return null; // All available keys are exhausted
  }

  /**
   * Marks an API key as exhausted (rate-limited / quota exceeded).
   * Moves the currentIndex to the next key.
   */
  markExhausted(service: string, userId: string, key: string, cooldownMs = 60 * 60 * 1000) {
    const userStates = this.serviceStates.get(service);
    if (!userStates) return;
    const state = userStates.get(userId);
    if (!state) return;

    state.exhaustedUntil.set(key, Date.now() + cooldownMs);
    // Advance to next index
    state.currentIndex = (state.currentIndex + 1) % state.keys.length;
    console.warn(`[UserKeyRotationManager] Key ${key.substring(0, 8)}... exhausted for service "${service}", user "${userId}". Cooldown: ${cooldownMs / 1000 / 60} minutes.`);
  }

  /**
   * Clears the exhausted/cooldown state for a user and service (useful if user updates their keys).
   */
  clearUserState(service: string, userId: string) {
    const userStates = this.serviceStates.get(service);
    if (userStates) {
      userStates.delete(userId);
    }
  }
}

export const userKeyRotationManager = new UserKeyRotationManager();
export default userKeyRotationManager;
