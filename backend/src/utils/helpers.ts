import crypto from "crypto";

/** Generate a new UUID v4 */
export const generateId = (): string => crypto.randomUUID();

/** Sleep for a given number of milliseconds */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Safely parse JSON, returning null on failure */
export const safeJsonParse = <T>(str: string): T | null => {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
};

/** Truncate a string to maxLength, appending "..." */
export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? str.slice(0, maxLength - 3) + "..." : str;
