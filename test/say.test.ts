import type { Hello } from "../src/main"

describe('SayHello', () => {
  it("sould sayHello", () => {
    const say:Hello = {
        name: "mipan"
    }
    console.info(say)
  })
})
