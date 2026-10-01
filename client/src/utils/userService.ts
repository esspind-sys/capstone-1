import tokenService from "./tokenService";
import type { User } from "../shared.types";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/users/`;

type Credentials = {
  email: string;
  password: string;
};

async function signup(credentials: Credentials): Promise<void> {
  try {
    const res = await axios.post(BASE_URL + "signup", credentials);
    tokenService.setToken(res.data.token);
  } catch (err) {
    console.log("Real signup error:", err);
    throw new Error("Email already taken!");
  }
}

async function login(credentials: Credentials): Promise<void> {
  try {
    const res = await axios.post(BASE_URL + "login", credentials);
    tokenService.setToken(res.data.token);
  } catch (err) {
    console.log("Real login error:", err);
    throw new Error("Invalid credentials!");
  }
}

function logout(): void {
  tokenService.removeToken();
}

function getUser(): User | null {
  return tokenService.getUserFromToken();
}

export default { signup, login, logout, getUser };