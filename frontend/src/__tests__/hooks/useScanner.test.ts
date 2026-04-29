import { renderHook, act, waitFor } from "@testing-library/react";
import { useScanner } from "@/hooks/useScanner";
import api from "@/lib/api";

// Mock api
jest.mock("@/lib/api");
const mockedApi = api as jest.Mocked<typeof api>;

// Mock navigator.vibrate
const mockVibrate = jest.fn();
if (typeof navigator !== "undefined") {
  (navigator as any).vibrate = mockVibrate;
}

describe("useScanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("valid scan calls validate endpoint and sets valid status", async () => {
    mockedApi.post.mockResolvedValue({ data: { valid: true, holderName: "Test User" } });

    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.validateTicket("ticket-123", "123456");
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/scan/validate", {
      ticketId: "ticket-123",
      totpToken: "123456",
    });
    expect(result.current.status).toBe("valid");
    expect(mockVibrate).toHaveBeenCalledWith(200);
  });

  it("409 response sets already_used status", async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 409 } });

    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.validateTicket("ticket-123", "123456");
    });

    expect(result.current.status).toBe("already_used");
  });

  it("422 response sets invalid_token status", async () => {
    mockedApi.post.mockRejectedValue({ response: { status: 422 } });

    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.validateTicket("ticket-123", "123456");
    });

    expect(result.current.status).toBe("invalid_token");
  });

  it("status resets to idle after 4 seconds", async () => {
    mockedApi.post.mockResolvedValue({ data: { valid: true } });

    const { result } = renderHook(() => useScanner());

    await act(async () => {
      await result.current.validateTicket("ticket-123", "123456");
    });

    expect(result.current.status).toBe("valid");

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.status).toBe("idle");
  });
});
