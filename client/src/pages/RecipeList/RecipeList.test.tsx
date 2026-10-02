import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RecipeList from "./RecipeList";
import { getAllRecipes } from "../../utils/recipeService";
import type { Recipe } from "../../shared.types";

vi.mock("../../utils/recipeService", () => ({
  getAllRecipes: vi.fn(),
}));

function makeRecipe(overrides: Partial<Recipe>): Recipe {
  return {
    _id: "1",
    title: "Pancakes",
    description: "Fluffy",
    image: "",
    ingredients: [{ name: "flour", quantity: "1 cup" }],
    instructions: [{ step: 1, description: "Mix" }],
    tags: ["breakfast"],
    ownerId: "u1",
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderList() {
  return render(
    <MemoryRouter>
      <RecipeList />
    </MemoryRouter>,
  );
}

describe("RecipeList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows a loading state first", () => {
    (getAllRecipes as Mock).mockReturnValue(new Promise(() => {}));
    renderList();
    expect(screen.getByText(/Loading recipes/i)).toBeInTheDocument();
  });

  it("shows the empty state when there are no recipes", async () => {
    (getAllRecipes as Mock).mockResolvedValue([]);
    renderList();
    expect(
      await screen.findByText(/Be the first to add one/i),
    ).toBeInTheDocument();
  });

  it("renders loaded recipes", async () => {
    (getAllRecipes as Mock).mockResolvedValue([
      makeRecipe({ _id: "1", title: "Pancakes" }),
      makeRecipe({ _id: "2", title: "Omelette", tags: ["eggs"] }),
    ]);
    renderList();
    expect(await screen.findByText("Pancakes")).toBeInTheDocument();
    expect(screen.getByText("Omelette")).toBeInTheDocument();
  });

  it("filters recipes by the search box", async () => {
    (getAllRecipes as Mock).mockResolvedValue([
      makeRecipe({ _id: "1", title: "Pancakes" }),
      makeRecipe({ _id: "2", title: "Omelette", tags: ["eggs"] }),
    ]);
    renderList();
    await screen.findByText("Pancakes");

    await userEvent.type(
      screen.getByLabelText("Search recipes"),
      "omelette",
    );

    await waitFor(() =>
      expect(screen.queryByText("Pancakes")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Omelette")).toBeInTheDocument();
  });
});