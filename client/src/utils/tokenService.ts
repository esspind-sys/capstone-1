import type { User } from "../shared.types";

function setToken(token: string): void {
  localStorage.setItem("token", token);
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

function removeToken(): void {
  localStorage.removeItem("token");
}

function getUserFromToken(): User | null {
  const token = getToken();
  if (!token) return null;
  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.user;
}

export default { setToken, getToken, removeToken, getUserFromToken };