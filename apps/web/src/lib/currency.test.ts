import { describe, expect, it } from "vitest";
import { convertKzt, formatMoney, parseNbkRates, toKzt, type Rates } from "./currency";

const RATES: Rates = { USD: 450, RUB: 5, asOf: "2026-11-10", source: "nbk" };

const XML = `<rates>
  <item><fullname>ДОЛЛАР США</fullname><title>USD</title><description>448.98</description><quant>1</quant></item>
  <item><fullname>РОССИЙСКИЙ РУБЛЬ</fullname><title>RUB</title><description>54.50</description><quant>10</quant></item>
</rates>`;

describe("parseNbkRates", () => {
  it("reads KZT per one unit and divides by quant", () => {
    expect(parseNbkRates(XML)).toEqual({ USD: 448.98, RUB: 5.45 });
  });

  it("returns null when a required currency is missing (feed not published yet)", () => {
    expect(parseNbkRates("<rates></rates>")).toBeNull();
    expect(parseNbkRates(XML.replace("RUB", "RUX"))).toBeNull();
  });
});

describe("convertKzt / toKzt", () => {
  it("keeps KZT as is and rounds foreign currencies to whole units", () => {
    expect(convertKzt(185000, "KZT", RATES)).toBe(185000);
    expect(convertKzt(185000, "USD", RATES)).toBe(411);
    expect(convertKzt(185000, "RUB", RATES)).toBe(37000);
  });

  it("converts a typed price back to KZT", () => {
    expect(toKzt(200, "USD", RATES)).toBe(90000);
    expect(toKzt(1000, "KZT", RATES)).toBe(1000);
  });
});

describe("formatMoney", () => {
  it("uses the tenge sign for KZT and groups thousands", () => {
    const text = formatMoney(185000, "KZT", RATES, "ru");
    expect(text).toContain("₸");
    expect(text.replace(/\s/g, "")).toContain("185000");
  });

  it("uses dollar and ruble signs", () => {
    expect(formatMoney(450000, "USD", RATES, "en")).toBe("$1,000");
    expect(formatMoney(5000, "RUB", RATES, "ru")).toContain("₽");
  });
});
