import { render, screen, fireEvent } from "@testing-library/react";
import { TicketCard } from "@/components/tickets/TicketCard";
import { Ticket } from "@/types/ticket";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Link as it's hard to test within JSDOM sometimes
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

const mockTicket: Ticket = {
  id: "ticket-123",
  orderId: "order-123",
  status: "PAID",
  isUsed: false,
  createdAt: new Date().toISOString(),
};

describe("TicketCard", () => {
  it("renders event name, date and status", () => {
    render(<TicketCard ticket={mockTicket} />);
    
    expect(screen.getByText(/Evento Principal/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmado/i)).toBeInTheDocument();
  });

  it("PAID status shows Confirmado badge in green", () => {
    render(<TicketCard ticket={mockTicket} />);
    
    const badge = screen.getByText(/Confirmado/i).parentElement;
    expect(badge).toHaveClass("bg-success/10");
  });

  it("PENDING status shows Pendente badge in blue", () => {
    const pendingTicket: Ticket = { ...mockTicket, status: "PENDING" };
    render(<TicketCard ticket={pendingTicket} />);
    
    expect(screen.getByText(/Aguardando Pagamento/i)).toBeInTheDocument();
    const badge = screen.getByText(/Aguardando Pagamento/i).parentElement;
    expect(badge).toHaveClass("bg-pending/10");
  });

  it("card link points to /tickets/[uuid]", () => {
    render(<TicketCard ticket={mockTicket} />);
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tickets/ticket-123");
  });
});
