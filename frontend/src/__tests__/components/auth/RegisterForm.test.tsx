import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RegisterForm } from "@/components/auth/RegisterForm";

// Mock the useAuth hook
const mockRegister = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: jest.fn(),
    register: mockRegister,
    logout: jest.fn(),
  }),
}));

// Mock the UI store
jest.mock("@/stores/uiStore", () => ({
  useUIStore: jest.fn((selector) => {
    const state = {
      toasts: [],
      addToast: jest.fn(),
      removeToast: jest.fn(),
    };
    return selector(state);
  }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  // Test 7: Senhas divergentes exibem erro de confirmação
  test("mismatched passwords shows confirm error", async () => {
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const cpfInput = screen.getByLabelText(/cpf/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmInput = screen.getByLabelText(/confirmar senha/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(cpfInput, { target: { value: "52998224725" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "differentpass" } });

    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/senhas não conferem/i)).toBeInTheDocument();
    });
  });

  // Test 8: Registro bem-sucedido chama register com dados corretos
  test("successful register calls register with correct data", async () => {
    mockRegister.mockResolvedValue(undefined);
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const cpfInput = screen.getByLabelText(/cpf/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmInput = screen.getByLabelText(/confirmar senha/i);

    fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
    fireEvent.change(cpfInput, { target: { value: "52998224725" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "newuser@example.com",
        "password123",
        "529.982.247-25"
      );
    });
  });

  test("empty submit shows validation errors for all fields", async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  test("renders 'Entrar' link pointing to /login", () => {
    render(<RegisterForm />);

    const loginLink = screen.getByRole("link", { name: /entrar/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("shows spinner during loading state", async () => {
    mockRegister.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    );
    render(<RegisterForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const cpfInput = screen.getByLabelText(/cpf/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmInput = screen.getByLabelText(/confirmar senha/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(cpfInput, { target: { value: "52998224725" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "password123" } });

    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    fireEvent.click(submitButton);

    // Check for spinner element via its role
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // Submit button should be disabled during loading and have loading text
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /carregando/i });
      expect(btn).toBeDisabled();
    });
  });
});
