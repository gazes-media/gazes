import Fuse from 'fuse.js'
import type { NekosamaAnime } from '../type/animeType'
import { animeCache } from './animeCache'

let fuse: Fuse<NekosamaAnime>

export function getFuse(animeList: NekosamaAnime[]): Fuse<NekosamaAnime> {
  if (fuse === undefined) {
    fuse = new Fuse(animeList, {
      includeScore: false,
      keys: ['title', 'title_english', 'title_romanji', 'title_french', 'others'],
    })
  }

  return fuse
}
