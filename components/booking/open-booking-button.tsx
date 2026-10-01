"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useBookingStore } from "@/lib/booking-store";
import type { ServiceType } from "@/schemas/healthcare";

/** Any button that opens the universal Quick Book modal. */
export function OpenBookingButton({
  serviceType,
  onClick,
  ...props
}: ButtonProps & { serviceType?: ServiceType }) {
  const openBooking = useBookingStore((s) => s.openBooking);
  return (
    <Button
      {...props}
      onClick={(e) => {
        onClick?.(e);
        openBooking(serviceType);
      }}
    />
  );
}
