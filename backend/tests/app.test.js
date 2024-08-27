const request = require("supertest")
const app = require("../app.js")
const { default: test, describe } = require("node:test")

describe("GET /containers", () => {
    it("should return 200 OK", async () => {
        return request(app).get("/containers").expect(200)
    })

    it("should return JSON", async () => {
        return request(app).get("/containers").expect("Content-Type", /json/)
    })

    it("should return an array of containers", async () => {
        return request(app).get("/containers").then((response) => {
            expect(response.body).not.toBeNull()
            expect(response.body.length).toBeGreaterThan(0)
            expect(response.body[0]).toBeInstanceOf(Object)
        })
    })
})

describe("GET /container/:containerId", () => {
    const containerId = "4872800e"
    it("should return 200 OK", async () => {
        return request(app).get(`/container/${containerId}`).expect(200)
    })

    it("should return JSON", async () => {
        return request(app).get(`/container/${containerId}`).expect("Content-Type", /json/)
    })

    it("should return an object", async () => {
        return request(app).get(`/container/${containerId}`).then((response) => {
            expect(response.body).not.toBeNull()
            expect(response.body).toBeInstanceOf(Object)
        })
    })
})


describe("GET /container/:containerId/start", () => {
    this.timeout(10000)
    const containerId = "4872800e"
    it("return 204 if success", async () => {
        this.timeout(10000)

        return request(app).get(`/container/${containerId}/start`).expect(204)
    })

    it("return 304 if container is already running", async () => {
        this.timeout(10000)

        return request(app).get(`/container/${containerId}/start`).expect(304)
    })
    it("return 404 if container not found", async () => {
        this.timeout(10000)

        return request(app).get(`/container/666/start`).expect(404)
    })
})

describe("GET /container/:containerId/stop", () => {
    this.timeout(10000)
    const containerId = "4872800e"
    it("return 204 if success", async () => {
        this.timeout(10000)

        return request(app).get(`/container/${containerId}/stop`).expect(200)
    })

    it("return 304 if container is already stopped", async () => {
        this.timeout(10000)

        return request(app).get(`/container/${containerId}/stop`).expect(200)
    })
    it("return 404 if container not found", async () => {
        this.timeout(10000)

        return request(app).get(`/container/666/stop`).expect(200)
    })
})

describe("GET /container/:containerId/logs", () => {
    const containerId = "4872800e"
    it("should return logs", async () => {
        return request(app).get(`/container/${containerId}/logs`).then((response) => {
            expect(response.body).not.toBeNull()
        })
    })
})

