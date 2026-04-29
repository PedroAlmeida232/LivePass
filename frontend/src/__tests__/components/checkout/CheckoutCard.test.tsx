import { render, screen, fireEvent } from "@testing-library/react";
import { CheckoutCard } from "@/components/checkout/CheckoutCard";
import { Event } from "@/types/ticket";

const mockEvent: Event = {
  id: "1",
  name: "Test Event",
  date: "2024-10-26",
  location: "Test Location",
  price: 100,
};

describe("CheckoutCard", () => {
  it("should trigger onGeneratePix when button is clicked", () => {
    const onGeneratePix = jest.fn();
    render(
      <CheckoutCard 
        event={mockEvent} 
        onGeneratePix={onGeneratePix} 
        isLoading={false} 
      />
    );

    fireEvent.click(screen.getByText(/GERAR PIX/i));
    expect(onGeneratePix).toHaveBeenCalledTimes(1);
  });

  it("should disable button and show loading state", () => {
    render(
      <CheckoutCard 
        event={mockEvent} 
        onGeneratePix={jest.fn()} 
        isLoading={true} 
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getAllByText(/Carregando.../i)[0]).toBeInTheDocument();
  });

  it("should render event details correctly", () => {
    render(
      <CheckoutCard 
        event={mockEvent} 
        onGeneratePix={jest.fn()} 
        isLoading={false} 
      />
    );

    expect(screen.getByText(mockEvent.name)).toBeInTheDocument();
    expect(screen.getByText(/R\$ 100,00/i)).toBeInTheDocument();
  });
});
