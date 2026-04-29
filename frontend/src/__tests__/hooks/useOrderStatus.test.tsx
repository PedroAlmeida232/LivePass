import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import api from "@/lib/api";

// Mock api
jest.mock("@/lib/api");
const mockedApi = api as jest.Mocked<typeof api>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useOrderStatus", () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it("should start polling when orderId is provided", async () => {
    mockedApi.get.mockResolvedValue({ data: { status: "PENDING" } });

    const { result } = renderHook(() => useOrderStatus("order-123"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith("/checkout/status/order-123");
  });

  it("should stop polling when status is PAID", async () => {
    mockedApi.get.mockResolvedValue({ data: { status: "PAID" } });

    const { result } = renderHook(() => useOrderStatus("order-123"), { wrapper });

    await waitFor(() => expect(result.current.data?.status).toBe("PAID"));
    
    // Check if refetchInterval becomes false
    // Since useOrderStatus uses a function for refetchInterval, 
    // we verify the logic indirectly or by checking the Query object
    const query = queryClient.getQueryCache().find({ queryKey: ["orderStatus", "order-123"] });
    // @ts-ignore - access internal property for testing
    const interval = query?.options.refetchInterval(query);
    expect(interval).toBe(false);
  });
});
