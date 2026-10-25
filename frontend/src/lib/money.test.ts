import { formatPrice } from "./money";

describe("formatPrice", () => {
  it("formats whole-dollar USD values", () => {
    expect(formatPrice(24999)).toBe("$24,999");
  });
});
