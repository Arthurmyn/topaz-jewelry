import type { Order } from "@/lib/state/orders";

/** MOCK order history for the profile page (frontend-only build). */
export const MOCK_ORDERS: Order[] = [
  {
    number: "000003",
    createdAt: "2026-10-02",
    status: "issued",
    totalKzt: 232000,
    lines: [],
    payment: "cod",
    delivery: "pickup",
  },
  {
    number: "000002",
    createdAt: "2026-09-14",
    status: "paid",
    totalKzt: 185000,
    lines: [],
    payment: "online",
    delivery: "delivery",
  },
  {
    number: "000001",
    createdAt: "2026-08-21",
    status: "placed",
    totalKzt: 96000,
    lines: [],
    payment: "request",
    delivery: "pickup",
  },
];
