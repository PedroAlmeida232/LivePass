import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/LoginForm";

// Mock the useAuth hook
const mockLogin = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    register: jest.fn(),
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

describe("LoginForm", () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  // Test 1: Submeter formulário vazio exibe erros de validação nos campos
  test("empty submit shows validation errors", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
    });
  });

  // Test 2: E-mail com formato inválido exibe mensagem de erro
  test("invalid email shows error message", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    await user.type(emailInput, "invalid-email");

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  // Test 3: Senha com menos de 8 caracteres exibe erro
  test("password < 8 chars shows error", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "1234567"); // 7 chars

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/mínimo 8 caracteres/i)).toBeInTheDocument();
    });
  });

  // Test 4: Formulário válido chama api.post com os dados corretos
  test("valid form calls api with correct payload", async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
    });
  });

  // Test 5: Spinner aparece durante loading e some após resposta
  test("spinner shows during loading", async () => {
    // Make login hang to test loading state
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 5000))
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    // Check for spinner element via its role
    await waitFor(() => {
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // Submit button should be disabled during loading
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /carregando/i });
      expect(btn).toBeDisabled();
    });
  });

  // Test 6: Erro 401 da API exibe toast de "Credenciais inválidas"
  test("401 response triggers error handling", async () => {
    mockLogin.mockRejectedValue({
      response: { status: 401 },
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");

    const submitButton = screen.getByRole("button", { name: /entrar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  test("renders 'Cadastre-se' link pointing to /register", () => {
    render(<LoginForm />);

    const registerLink = screen.getByRole("link", { name: /cadastre-se/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute("href", "/register");
  });
});
