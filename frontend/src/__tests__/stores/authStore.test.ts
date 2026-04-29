import { renderHook, act } from "@testing-library/react";
import { useAuthStore } from "@/stores/authStore";

// Clear localStorage and store before each test
beforeEach(() => {
  localStorage.clear();
  act(() => {
    useAuthStore.getState().clearAuth();
  });
});

describe("authStore", () => {
  // Test 9: setAuth persiste dados do usuário corretamente
  test("setAuth stores user data", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setAuth({
        email: "user@example.com",
        role: "CUSTOMER",
      });
    });

    expect(result.current.user).toEqual({
      email: "user@example.com",
      role: "CUSTOMER",
    });
    expect(result.current.isAuthenticated).toBe(true);

    // Verify localStorage persistence
    expect(JSON.parse(localStorage.getItem("auth-user")!)).toEqual({
      email: "user@example.com",
      role: "CUSTOMER",
    });
  });

  // Test 10: clearAuth zera o estado completamente
  test("clearAuth resets state to initial", () => {
    const { result } = renderHook(() => useAuthStore());

    // First set some auth data
    act(() => {
      result.current.setAuth({
        email: "user@example.com",
        role: "STAFF",
      });
    });

    // Then clear it
    act(() => {
      result.current.clearAuth();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);

    // Verify localStorage cleared
    expect(localStorage.getItem("auth-user")).toBeNull();
  });

  test("hydrate restores auth state from localStorage", () => {
    // Set data directly in localStorage
    localStorage.setItem(
      "auth-user",
      JSON.stringify({ email: "hydrated@example.com", role: "CUSTOMER" })
    );

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.hydrate();
    });

    expect(result.current.user?.email).toBe("hydrated@example.com");
    expect(result.current.isAuthenticated).toBe(true);
  });

  test("hydrate handles invalid JSON in localStorage gracefully", () => {
    localStorage.setItem("auth-user", "invalid-json{{{");

    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.hydrate();
    });

    // Should not crash, localStorage should be cleaned
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("auth-user")).toBeNull();
  });
});
