import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import userService from "../../utils/userService";
import "./SignupPage.css";

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
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Join Spoonful to save and share recipes.</p>

        <form className="auth-form" autoComplete="off" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span className="auth-label">Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={state.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Password</span>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={state.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="auth-field">
            <span className="auth-label">Confirm Password</span>
            <input
              type="password"
              name="passwordConf"
              placeholder="Re-enter your password"
              value={state.passwordConf}
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit" className="auth-submit">
            Sign Up
          </button>

          {error ? <ErrorMessage message={error} /> : null}
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}