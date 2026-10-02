import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerateRecipePage from "./GenerateRecipePage";
import { streamRecipe } from "../../utils/aiService";

vi.mock("../../utils/aiService", () => ({
  streamRecipe: vi.fn(),
}));

describe("GenerateRecipePage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("disables the button when the input is empty", () => {
    render(<GenerateRecipePage />);
    expect(
      screen.getByRole("button", { name: "Generate Recipe" }),
    ).toBeDisabled();
  });

  it("streams a response and records it in history", async () => {
    (streamRecipe as Mock).mockImplementation(
      async (_prompt: string, onText: (t: string) => void) => {
        onText("Title: Test Dish");
      },
    );

    render(<GenerateRecipePage />);
    await userEvent.type(
      screen.getByPlaceholderText(/chicken parmesan/i),
      "tacos",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Generate Recipe" }),
    );

    expect(streamRecipe).toHaveBeenCalledOnce();

    // The response appears twice: once in the live output, once in history.
    // Both are expected, so assert on all matches rather than a single one.
    const matches = await screen.findAllByText(/Title: Test Dish/);
    expect(matches).toHaveLength(2);

    // The history <summary> shows the dish name.
    expect(screen.getByText("tacos")).toBeInTheDocument();
  });

  it("surfaces an error if the stream fails", async () => {
    (streamRecipe as Mock).mockRejectedValue(new Error("AI down"));
    render(<GenerateRecipePage />);

    await userEvent.type(
      screen.getByPlaceholderText(/chicken parmesan/i),
      "tacos",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Generate Recipe" }),
    );

    expect(await screen.findByText("AI down")).toBeInTheDocument();
  });
});