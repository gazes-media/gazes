import { describe, expect, it } from "bun:test"
import { app } from ".."
import { Anime, isAnime } from "../types/anime.types"

describe("filterAnimes", () => {
    it("should have a 200 status", async () => {
        const response = await app.handle(new Request("http://localhost/animes"))

        expect(response.status).toBe(200)
    })

    it("should return a array with a length of 25", async () => {
        const response = await app.handle(new Request("http://localhost/animes"))
        const data = await response.json()

        expect(data).toBeArray()
        expect(data.length).toBeLessThanOrEqual(25)
    })

    it("should return only animes with specific genres", async () => {
        const response = await app.handle(new Request("http://localhost/animes?genres=action"))
        const animes = (await response.json()) as Anime[]

        expect(animes.every((anime) => anime.genres.includes("action"))).toBe(true)
    })

    it("should return only animes with specific start date year", async () => {
        const response = await app.handle(new Request("http://localhost/animes?start_date_year=2023"))
        const animes = (await response.json()) as Anime[]

        animes.every((anime) => expect(anime.start_date_year).toBe(2023))
    })

    it("should match the real Anime type", async () => {
        const response = await app.handle(new Request("http://localhost/animes"))
        const animes = (await response.json()) as Anime[]
        
        expect(isAnime(animes[0])).toBe(true)
    })
})
