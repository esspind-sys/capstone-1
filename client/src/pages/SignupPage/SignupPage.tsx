import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import userService from "../../utils/userService";

type State = {
  email: string;
  password: string;
  passwordConf: string;
};

type SignupPageProps = {
  handleSignUpOrLogin: () => void;
};

export default function SignupPage({ handleSignUpOrLogin }: SignupPageProps) {
  const [error, setError] = useState("");
  const [state, setState] = useState<State>({
    email: "",
    password: "",
    passwordConf: "",
  });

  const navigate = useNavigate();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setState({ ...state, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.password !== state.passwordConf) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await userService.signup({ email: state.email, password: state.password });
      handleSignUpOrLogin();
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    }
  }

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
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
        <input
          type="password"
          name="passwordConf"
          placeholder="Confirm Password"
          value={state.passwordConf}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
        {error ? <ErrorMessage message={error} /> : null}
      </form>
    </div>
  );
}