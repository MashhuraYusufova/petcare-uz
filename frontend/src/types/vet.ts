export interface Vet {
  id: string; name: string; spec: string; clinic: string; district: string;
  rating: number; reviews: number; exp: string; price: string; avail: boolean;
  slots: string[]; email: string | null;
}

export interface Appointment {
  id: string; date: string; status: string; reason: string | null;
  user: { id: string; name: string; email: string };
}

export interface Stats {
  upcomingCount: number; pendingCount: number; completedCount: number;
  rating: number; reviews: number;
}

export interface SlotState { time: string; status: "available" | "blocked" | "booked" }
