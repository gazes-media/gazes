import { expect, test } from 'bun:test'
import { animeCache, fillAnimeCache } from './animeCache'

test('fillAnimeCache fetches data and updates animeCache', async () => {
  await fillAnimeCache()
  expect(animeCache.length).toBeGreaterThan(0)
})
