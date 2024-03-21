import { describe, expect, it } from "bun:test"
import { app } from ".."

describe("filterAnimes", () => {
    it("should have a 200 status", async () => {
        const response = await app.handle(new Request("http://localhost/animes/1"))
        expect(response.status).toBe(200)
    })

    it("should return a array", async () => {
        const response = await app.handle(new Request("http://localhost/animes/1"))
        expect(await response.json()).toBeArray()
    })
})
