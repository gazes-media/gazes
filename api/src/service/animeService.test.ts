import { describe, it, expect } from 'bun:test'
import { filterAnimeList } from './animeService'
import type { NekosamaAnime } from '../type/animeType'

describe('filterAnimeList', () => {
  const animeList = [
    { title: 'Anime1', genres: ['Action'], start_date_year: '2020' },
    { title: 'Anime2', genres: ['Adventure'], start_date_year: '2021' },
    { title: 'Anime3', genres: ['Action', 'Adventure'], start_date_year: '2022' },
  ] as NekosamaAnime[]

  it('should filter anime list by title', () => {
    const filteredList = filterAnimeList(animeList, { title: 'Anime1' })
    expect(filteredList[0].title).toBe('Anime1')
  })

  it('should filter anime list by genreList', () => {
    const filteredList = filterAnimeList(animeList, { genreList: ['Action'] })
    expect(filteredList.length).toBe(2)
    expect(filteredList.every(anime => anime.genres.includes('Action'))).toBe(true)
  })

  it('should filter anime list by releaseDate', () => {
    const filteredList = filterAnimeList(animeList, { releaseDate: 2021 })
    expect(filteredList.length).toBe(1)
    expect(filteredList[0].start_date_year).toBe('2021')
  })

  it('should return unfiltered list if no filter criteria provided', () => {
    const filteredList = filterAnimeList(animeList)
    expect(filteredList.length).toBe(animeList.length)
  })
})
