import {
  Activity,
  BedDouble,
  Droplet,
  FlaskConical,
  Flower2,
  HeartHandshake,
  MessageCircleHeart,
  Pill,
  Salad,
  Smile,
  Stethoscope,
  UserRoundCheck,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { ServiceIconName } from "@/lib/services";

export const serviceIcons: Record<ServiceIconName, LucideIcon> = {
  stethoscope: Stethoscope,
  "heart-handshake": HeartHandshake,
  "user-check": UserRoundCheck,
  activity: Activity,
  flask: FlaskConical,
  pill: Pill,
  salad: Salad,
  "message-heart": MessageCircleHeart,
  flower: Flower2,
  bed: BedDouble,
  smile: Smile,
  droplet: Droplet,
};

export function ServiceIcon({ name, ...props }: { name: ServiceIconName } & LucideProps) {
  const Icon = serviceIcons[name];
  return <Icon aria-hidden {...props} />;
}
