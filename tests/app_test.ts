import { assertEquals } from "@std/assert/equals";
import { stub } from "@std/testing/mock";

Deno.test("/", (t) => {
  t.step("healthcheck", async (t) => {
    const response = await app.request("/", { method: "GET" });

    const st = stub(Deno, "readTextFileSync");

    assertEquals(await response.json(), { status: "healthy" });
  });
});
