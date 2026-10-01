"use client";

import { create } from "zustand";
import type { ServiceType } from "@/schemas/healthcare";

type BookingState = {
  open: boolean;
  serviceType?: ServiceType;
  openBooking: (serviceType?: ServiceType) => void;
  setOpen: (open: boolean) => void;
};

/** Drives the universal "Quick Book" modal from anywhere on the site. */
export const useBookingStore = create<BookingState>((set) => ({
  open: false,
  serviceType: undefined,
  openBooking: (serviceType) => set({ open: true, serviceType }),
  setOpen: (open) => set({ open }),
}));
