import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Ticket } from "@/types/ticket";

export const useTickets = () => {
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async (): Promise<Ticket[]> => {
      const { data } = await api.get<Ticket[]>("/tickets/mine");
      return data;
    },
  });
};
