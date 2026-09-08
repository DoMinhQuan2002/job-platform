import { describe, expect, it } from "vitest";
import { expandSearchKeywords } from "./job-synonyms";

describe("expandSearchKeywords", () => {
  it("should expand 'thực tập sinh' to include 'intern', 'internship', 'trainee'", () => {
    const result = expandSearchKeywords("thực tập sinh");
    expect(result).toContain("thực tập sinh");
    expect(result).toContain("intern");
    expect(result).toContain("internship");
    expect(result).toContain("trainee");
    expect(result).toContain("thực tập");
  });

  it("should expand 'intern' to include 'thực tập sinh' and 'internship'", () => {
    const result = expandSearchKeywords("intern");
    expect(result).toContain("intern");
    expect(result).toContain("thực tập sinh");
    expect(result).toContain("internship");
    expect(result).toContain("trainee");
  });

  it("should expand compound keyword 'thực tập sinh react'", () => {
    const result = expandSearchKeywords("thực tập sinh react");
    expect(result).toContain("thực tập sinh react");
    expect(result).toContain("intern");
    expect(result.some((k) => k.includes("intern"))).toBe(true);
  });

  it("should expand 'developer' to include 'lập trình viên'", () => {
    const result = expandSearchKeywords("developer");
    expect(result).toContain("developer");
    expect(result).toContain("lập trình viên");
    expect(result).toContain("dev");
  });

  it("should return empty array for empty or whitespace input", () => {
    expect(expandSearchKeywords("")).toEqual([]);
    expect(expandSearchKeywords("   ")).toEqual([]);
  });

  it("should preserve unique unrecognized keywords", () => {
    const result = expandSearchKeywords("blockchain");
    expect(result).toEqual(["blockchain"]);
  });
});
