import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NavBar from "./NavBar";
import type { User } from "../shared.types";

function renderNav(user: User | null, handleLogout = vi.fn()) {
  return render(
    <MemoryRouter>
      <NavBar user={user} handleLogout={handleLogout} />
    </MemoryRouter>,
  );
}

describe("NavBar", () => {
  it("always shows the brand and core links", () => {
    renderNav(null);
    expect(screen.getByText("Spoonful")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recipes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Generate" })).toBeInTheDocument();
  });

  it("shows Sign Up and Log In when logged out", () => {
    renderNav(null);
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log In" })).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("shows the user email, New Recipe and Logout when logged in", () => {
    const user: User = { _id: "u1", email: "chef@test.com" };
    renderNav(user);
    expect(screen.getByText(/chef@test\.com/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "New Recipe" })).toBeInTheDocument();
    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
  });

  it("calls handleLogout when Logout is clicked", async () => {
    const handleLogout = vi.fn();
    renderNav({ _id: "u1", email: "chef@test.com" }, handleLogout);
    await userEvent.click(screen.getByRole("link", { name: "Logout" }));
    expect(handleLogout).toHaveBeenCalledOnce();
  });
});