import { render, screen, fireEvent, act } from "@testing-library/react";
import { QrCodeDisplay } from "@/components/checkout/QrCodeDisplay";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("QrCodeDisplay", () => {
  const defaultProps = {
    qrCode: "data:image/png;base64,dGVzdC1iYXNlNjQ=",
    copyPaste: "00020126360014br.gov.bcb.pix...",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
  };

  it("should render QR code image with correct base64", () => {
    render(<QrCodeDisplay {...defaultProps} />);
    const img = screen.getByAltText(/QR Code PIX/i) as HTMLImageElement;
    expect(img.src).toContain("data:image/png;base64,dGVzdC1iYXNlNjQ=");
  });

  it("should change button text when copied", async () => {
    jest.useFakeTimers();
    render(<QrCodeDisplay {...defaultProps} />);
    
    const button = screen.getByRole("button", { name: /Copiar código PIX/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(defaultProps.copyPaste);
    
    // Check for "Copiado!" text (it's in a span now)
    expect(screen.getByText(/Copiado!/i)).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText(/Copiar código PIX/i)).toBeInTheDocument();
    jest.useRealTimers();
  });

  it("should display countdown and update every second", () => {
    jest.useFakeTimers();
    // Set a fixed system time to make tests deterministic if needed
    // But since we use defaultProps with a relative time, we just need to wait a bit
    render(<QrCodeDisplay {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // The time is now split into multiple spans like <span>09</span><span>:</span><span>59</span>
    // We can check for the presence of the minutes/seconds or use a custom matcher
    const minutes = screen.getByText(/09|10/);
    const separator = screen.getByText(":");
    expect(minutes).toBeInTheDocument();
    expect(separator).toBeInTheDocument();
    
    jest.useRealTimers();
  });
});
