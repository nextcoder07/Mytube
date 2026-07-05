// providers/website/search.ts — Not applicable; website provider is fetch-only
export async function searchWebsite(): Promise<never[]> {
  // The website provider doesn't support keyword search — it only fetches specific URLs.
  return [];
}
