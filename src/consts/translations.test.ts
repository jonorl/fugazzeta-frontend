import { describe, it, expect } from "@jest/globals";
import { translations } from "./translations";

describe("translations", () => {
  it("has the same keys in every language", () => {
    expect(Object.keys(translations.es).sort()).toEqual(Object.keys(translations.en).sort());
  });

  it("has no empty strings", () => {
    for (const strings of Object.values(translations)) {
      for (const value of Object.values(strings)) expect(value.trim()).not.toBe("");
    }
  });
});
