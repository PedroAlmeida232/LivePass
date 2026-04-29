import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { OrderStatusResponse } from "@/types/ticket";

export const useOrderStatus = (orderId: string | null) => {
  return useQuery({
    queryKey: ["orderStatus", orderId],
    queryFn: async (): Promise<OrderStatusResponse> => {
      const { data } = await api.get<OrderStatusResponse>(`/checkout/status/${orderId}`);
      return data;
    },
    enabled: !!orderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return (status === "PAID" || status === "CANCELLED") ? false : 3000;
    },
  });
};
