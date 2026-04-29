import { render, screen } from "@testing-library/react";
import { TotpQrCode } from "@/components/tickets/TotpQrCode";
import { useTotpQr } from "@/hooks/useTotpQr";

// Mock the hook
jest.mock("@/hooks/useTotpQr");
const mockedUseTotpQr = useTotpQr as jest.Mock;

describe("TotpQrCode", () => {
  it("shows spinner while loading", () => {
    mockedUseTotpQr.mockReturnValue({
      token: null,
      countdown: 30,
      isLoading: true,
    });

    render(<TotpQrCode ticketId="ticket-123" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays QR code SVG when data is available", () => {
    mockedUseTotpQr.mockReturnValue({
      token: "123456",
      countdown: 30,
      isLoading: false,
    });

    const { container } = render(<TotpQrCode ticketId="ticket-123" />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("displays countdown value", () => {
    mockedUseTotpQr.mockReturnValue({
      token: "123456",
      countdown: 15,
      isLoading: false,
    });

    render(<TotpQrCode ticketId="ticket-123" />);
    expect(screen.getByText("15s")).toBeInTheDocument();
    expect(screen.getByText(/Renova em 15s/i)).toBeInTheDocument();
  });
});
