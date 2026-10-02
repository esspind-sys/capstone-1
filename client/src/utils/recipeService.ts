import axios from "axios";
import type { Recipe } from "../shared.types";
import tokenService from "./tokenService";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/recipes`;

export type NewRecipeData = {
  title: string;
  description?: string;
  image?: string;
  ingredients: { name: string; quantity: string }[];
  instructions: { step: number; description: string }[];
  tags: string[];
};

export async function getAllRecipes(): Promise<Recipe[]> {
  const res = await axios.get<Recipe[]>(BASE_URL);
  return res.data;
}

export async function getRecipe(id: string): Promise<Recipe> {
  const res = await axios.get<Recipe>(`${BASE_URL}/${id}`);
  return res.data;
}

export async function createRecipe(recipe: NewRecipeData): Promise<Recipe> {
  const token = tokenService.getToken();
  const res = await axios.post<Recipe>(BASE_URL, recipe, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateRecipe(
  id: string,
  recipe: NewRecipeData,
): Promise<Recipe> {
  const token = tokenService.getToken();
  const res = await axios.put<Recipe>(`${BASE_URL}/${id}`, recipe, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteRecipe(id: string): Promise<void> {
  const token = tokenService.getToken();
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}