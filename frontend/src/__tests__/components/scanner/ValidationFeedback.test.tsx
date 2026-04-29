import { render, screen, act } from "@testing-library/react";
import { ValidationFeedback } from "@/components/scanner/ValidationFeedback";

describe("ValidationFeedback", () => {
  it("valid status renders green panel with title", () => {
    render(<ValidationFeedback status="valid" result={{ holderName: "João Silva" }} />);
    
    expect(screen.getByText(/INGRESSO VÁLIDO/i)).toBeInTheDocument();
    expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
  });

  it("already_used renders red panel", () => {
    render(<ValidationFeedback status="already_used" result={{ message: "Já validado" }} />);
    
    expect(screen.getByText(/INGRESSO JÁ UTILIZADO/i)).toBeInTheDocument();
  });

  it("invalid_token renders yellow panel with instruction", () => {
    render(<ValidationFeedback status="invalid_token" result={{ message: "Token expirado" }} />);
    
    expect(screen.getByText(/TOKEN INVÁLIDO OU EXPIRADO/i)).toBeInTheDocument();
  });
});
