import { renderHook, act, waitFor } from "@testing-library/react";
import { useTotpQr } from "@/hooks/useTotpQr";
import api from "@/lib/api";
import { authenticator } from "otplib";

// Mock api
jest.mock("@/lib/api");
const mockedApi = api as jest.Mocked<typeof api>;

// Mock otplib
jest.mock("otplib", () => ({
  authenticator: {
    generate: jest.fn(),
  },
}));

describe("useTotpQr", () => {
  const ticketId = "ticket-123";
  const mockSeedResponse = {
    data: {
      totpSeed: "JBSWY3DPEHPK3PXP",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01T00:00:00Z")); // epoch % 30 == 0, so remaining = 30
    (authenticator.generate as jest.Mock).mockReturnValue("123456");
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("hook returns valid token on mount", async () => {
    mockedApi.get.mockResolvedValue(mockSeedResponse);

    const { result } = renderHook(() => useTotpQr(ticketId));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.token).toBe("123456");
    expect(mockedApi.get).toHaveBeenCalledTimes(1);
    expect(result.current.countdown).toBe(30);
  });

  it("countdown decrements each second", async () => {
    mockedApi.get.mockResolvedValue(mockSeedResponse);

    const { result } = renderHook(() => useTotpQr(ticketId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.countdown).toBe(30);

    act(() => {
      jest.advanceTimersByTime(1000);
      jest.setSystemTime(new Date("2024-01-01T00:00:01Z"));
    });
    
    expect(result.current.countdown).toBe(29);
  });

  it("token updates automatically and does NOT fetch seed again", async () => {
    mockedApi.get.mockResolvedValue(mockSeedResponse);

    const { result } = renderHook(() => useTotpQr(ticketId));
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockedApi.get).toHaveBeenCalledTimes(1);

    (authenticator.generate as jest.Mock).mockReturnValue("654321");

    // Advance time to the next 30s window
    act(() => {
      jest.setSystemTime(new Date("2024-01-01T00:00:30Z"));
      jest.advanceTimersByTime(30000);
    });
    
    expect(result.current.token).toBe("654321");
    expect(result.current.countdown).toBe(30);
    // Should NOT have fetched again
    expect(mockedApi.get).toHaveBeenCalledTimes(1);
  });

  it("hook cleanup cancels interval on unmount", () => {
    mockedApi.get.mockResolvedValue(mockSeedResponse);
    const { unmount } = renderHook(() => useTotpQr(ticketId));
    
    unmount();
    
    act(() => {
      jest.advanceTimersByTime(10000);
    });
  });
});
