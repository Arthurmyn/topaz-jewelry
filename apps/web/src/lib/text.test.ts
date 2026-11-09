import { describe, expect, it } from "vitest";
import { fmt, pf, plural } from "./text";

describe("fmt", () => {
  it("fills placeholders and keeps unknown ones visible", () => {
    expect(fmt("Корзина ({n})", { n: 3 })).toBe("Корзина (3)");
    expect(fmt("{a} {b}", { a: "x" })).toBe("x {b}");
  });
});

describe("plural", () => {
  const ru = pf({
    one: "{n} изделие",
    few: "{n} изделия",
    many: "{n} изделий",
    other: "{n} изделия",
  });
  const en = pf({ one: "{n} item", other: "{n} items" });

  it("handles Russian forms", () => {
    expect(plural(ru, 1, "ru")).toBe("1 изделие");
    expect(plural(ru, 2, "ru")).toBe("2 изделия");
    expect(plural(ru, 5, "ru")).toBe("5 изделий");
    expect(plural(ru, 11, "ru")).toBe("11 изделий");
    expect(plural(ru, 21, "ru")).toBe("21 изделие");
    expect(plural(ru, 128, "ru")).toBe("128 изделий");
  });

  it("handles English forms", () => {
    expect(plural(en, 1, "en")).toBe("1 item");
    expect(plural(en, 2, "en")).toBe("2 items");
  });
});
