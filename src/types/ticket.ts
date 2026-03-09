import type { GeoPoint, Timestamp } from "firebase/firestore";

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export type TicketPriority = (typeof PRIORITIES)[number];
export type TicketStatus = (typeof STATUSES)[number];

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  location: string | null;
  locationCoordinates: GeoPoint | null;
  createdAt: Timestamp | null;
  status: TicketStatus;
}

export interface TicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  category: string;
  location: string | null;
  locationCoordinates: GeoPoint | null;
}
