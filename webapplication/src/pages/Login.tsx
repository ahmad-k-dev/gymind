import { useState } from "react";
import type { FormEvent } from "react";
import "../styles/Login.css";

type ViewMode = "login" | "forgot" | "reset";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:7179/api";

const Login = () => {
  const [mode, setMode] = useState<ViewMode>("forgot");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Invalid credentials.");
      setMessage("Login successful. Token received from API.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not login.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onForgot = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => ({} as Record<string, unknown>));
      if (!response.ok) {
        const apiMessage = typeof payload.message === "string" ? payload.message : "Could not request password reset.";
        throw new Error(apiMessage);
      }
      const devToken = payload.developmentResetToken as string | undefined;
      if (devToken) {
        setToken(devToken);
        setMessage("Development mode: reset token auto-filled below. Use it to complete reset.");
      } else {
        setMessage(payload.message ?? "If an account exists, a reset link was sent.");
      }
      setMode("reset");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request failed.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const onReset = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) throw new Error("Reset failed. Check token and password rules.");
      const payload = await response.json();
      setMessage(payload.message ?? "Password reset successful.");
      setMode("login");
      setToken("");
      setNewPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reset failed.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <h2>GYMIND Auth</h2>
      <div className="auth-tabs">
        <button onClick={() => setMode("login")}>Login</button>
        <button onClick={() => setMode("forgot")}>Forgot Password</button>
        <button onClick={() => setMode("reset")}>Reset Password</button>
      </div>

      {mode === "login" && (
        <form onSubmit={onLogin} className="auth-form">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={isLoading}>Sign In</button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={onForgot} className="auth-form">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" disabled={isLoading}>Request Reset</button>
        </form>
      )}

      {mode === "reset" && (
        <form onSubmit={onReset} className="auth-form">
          <input type="text" required placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password (8+ chars, upper/lower/number/symbol)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit" disabled={isLoading}>Reset Password</button>
        </form>
      )}

      {message && <p className={isError ? "auth-message error" : "auth-message"}>{message}</p>}
    </div>
  );
};

export default Login;
