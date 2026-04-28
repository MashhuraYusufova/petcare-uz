import { Request } from "express";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
  vet?: AnyVet;
}

export interface AnyVet {
  id: string;
  name: string;
  spec: string;
  clinic: string;
  district: string;
  rating: number;
  reviews: number;
  exp: string;
  price: string;
  avail: boolean;
  slots: string[];
  email: string | null;
}
