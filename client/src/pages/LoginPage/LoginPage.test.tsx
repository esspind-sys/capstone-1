import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";
import userService from "../../utils/userService";

vi.mock("../../utils/userService", () => ({
  default: {
    login: vi.fn(),
    signup: vi.fn(),
    getUser: vi.fn(),
    logout: vi.fn(),
  },
}));

function renderLogin(onAuth = vi.fn()) {
  return render(
    <MemoryRouter>
      <LoginPage handleSignUpOrLogin={onAuth} />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password"),
    ).toBeInTheDocument();
  });

  it("submits credentials and notifies the parent on success", async () => {
    (userService.login as Mock).mockResolvedValue(undefined);
    const onAuth = vi.fn();
    renderLogin(onAuth);

    await userEvent.type(
      screen.getByPlaceholderText("you@example.com"),
      "chef@test.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "secret123",
    );
    await userEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(userService.login).toHaveBeenCalledWith({
      email: "chef@test.com",
      password: "secret123",
    });
    expect(onAuth).toHaveBeenCalledOnce();
  });

  it("shows an error message when login fails", async () => {
    (userService.login as Mock).mockRejectedValue(
      new Error("Invalid credentials"),
    );
    renderLogin();

    await userEvent.type(
      screen.getByPlaceholderText("you@example.com"),
      "bad@test.com",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrong",
    );
    await userEvent.click(screen.getByRole("button", { name: "Log In" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});