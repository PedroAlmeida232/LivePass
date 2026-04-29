export type TicketStatus = "PENDING" | "PAID" | "CANCELLED";

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  price: number;
}

export interface Ticket {
  id: string;
  orderId: string;
  status: TicketStatus;
  isUsed: boolean;
  createdAt: string;
}

export interface CheckoutResponse {
  orderId: string;
  qrCode: string;   // URL ou Base64 conforme doc
  copyPaste: string;
  expiresAt: string;
}

export interface OrderStatusResponse {
  orderId: string;
  status: TicketStatus;
}
