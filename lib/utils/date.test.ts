import { describe, it, expect } from "vitest";
import { pad2, toIsoDate, parseIsoDate, formatDisplayTime } from "./date";

describe("pad2", () => {
  it("pads single digits with a leading zero", () => {
    expect(pad2(5)).toBe("05");
    expect(pad2(12)).toBe("12");
  });
});

describe("toIsoDate / parseIsoDate round-trip", () => {
  it("round-trips a local date without shifting by a day", () => {
    const original = new Date(2026, 6, 21); // July 21 2026, local time
    const iso = toIsoDate(original);
    expect(iso).toBe("2026-07-21");

    const parsed = parseIsoDate(iso);
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(6);
    expect(parsed?.getDate()).toBe(21);
  });

  it("returns undefined for an empty or invalid string", () => {
    expect(parseIsoDate("")).toBeUndefined();
    expect(parseIsoDate(undefined)).toBeUndefined();
  });
});

describe("formatDisplayTime", () => {
  it("converts 24-hour HH:mm to a 12-hour display string", () => {
    expect(formatDisplayTime("00:00")).toBe("12:00 AM");
    expect(formatDisplayTime("13:05")).toBe("1:05 PM");
    expect(formatDisplayTime("23:59")).toBe("11:59 PM");
    expect(formatDisplayTime("12:00")).toBe("12:00 PM");
  });

  it("returns an empty string for missing or malformed input", () => {
    expect(formatDisplayTime()).toBe("");
    expect(formatDisplayTime("not-a-time")).toBe("");
  });
});
