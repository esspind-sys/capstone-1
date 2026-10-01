export type Ingredient = {
  _id?: string;
  name: string;
  quantity: string;
};

export type Instruction = {
  _id?: string;
  step: number;
  description: string;
};

export type Recipe = {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  tags: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  _id: string;
  email: string;
};