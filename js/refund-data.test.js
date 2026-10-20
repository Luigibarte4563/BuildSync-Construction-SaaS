import test from "node:test";
import assert from "node:assert/strict";
import { encodeOrder, decodeOrder } from "./refund-data.js";

const order = {
  id: "BS-ABC123",
  items: [
    { name: "Professional", unit: "per workspace / month", qty: 1, price: 4999 },
    { name: "Starter", unit: "per workspace / month", qty: 2, price: 1999 },
  ],
  subtotal: 8997,
  vat: 1079.64,
  total: 10076.64,
  method: "Online banking - BDO",
};

test("an order payload round-trips through the refund link", () => {
  assert.deepEqual(decodeOrder(encodeOrder(order)), order);
});

test("malformed order payloads return null", () => {
  assert.equal(decodeOrder("not-base64"), null);
  assert.equal(decodeOrder(""), null);
});
