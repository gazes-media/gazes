import { t } from 'elysia'

export const NekosamaAnime = t.Object({
  id: t.Number(),
  title: t.String(),
  title_english: t.String(),
  title_romanji: t.String(),
  title_french: t.Optional(t.String()),
  others: t.String(),
  type: t.String(),
  status: t.String(),
  popularity: t.Number(),
  url: t.String(),
  genres: t.Array(t.String()),
  url_image: t.String(),
  score: t.String(),
  start_date_year: t.String(),
  nb_eps: t.String(),
})

export type NekosamaAnime = (typeof NekosamaAnime)['static']
