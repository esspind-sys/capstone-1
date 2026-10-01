import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import userService from "../../utils/userService";

type State = {
  email: string;
  password: string;
};

type LoginPageProps = {
  handleSignUpOrLogin: () => void;
};

export default function LoginPage({ handleSignUpOrLogin }: LoginPageProps) {
  const [error, setError] = useState("");
  const [state, setState] = useState<State>({ email: "", password: "" });
  const navigate = useNavigate();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setState({ ...state, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      await userService.login(state);
      handleSignUpOrLogin();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  }

  return (
    <div className="login-page">
      <h2>Log In</h2>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="email"
          value={state.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          value={state.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
        {error ? <ErrorMessage message={error} /> : null}
      </form>
    </div>
  );
}