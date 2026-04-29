import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { CheckoutResponse } from "@/types/ticket";

export const useCheckout = () => {
  return useMutation({
    mutationFn: async (): Promise<CheckoutResponse> => {
      // O backend agora recupera CPF/Email dinamicamente do usuário logado
      const { data } = await api.post<CheckoutResponse>("/checkout/pix");
      return data;
    },
  });
};
