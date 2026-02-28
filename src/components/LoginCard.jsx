import React, { useState } from "react";

function LoginCard({
  title = "Login to Mindful Living",
  subtitle = "Enter your credential to login to your account",
  submitText = "Sign In",
  loadingText = "Signing into your account...",
  forgotText = "Forgot Password?",
  errorMessage = "",
  isSubmitting = false,
  onSubmit,
  onForgotPassword,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
    };

    if (onSubmit) onSubmit(payload);
  };

  return (
    <section className="login-card">
      <div className="logo-badge" aria-hidden="true">
        <span className="logo-dot logo-dot-left" />
        <span className="logo-dot logo-dot-right" />
      </div>

      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address *</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          disabled={isSubmitting}
          required
        />

        <label htmlFor="password">Password *</label>
        <div className="password-wrapper">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            disabled={isSubmitting}
            required
          />
          <button
            type="button"
            className="icon-button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path d="M12 5C6.6 5 2.2 8.5 1 12c1.2 3.5 5.6 7 11 7s9.8-3.5 11-7c-1.2-3.5-5.6-7-11-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6.2a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Z" />
            </svg>
          </button>
        </div>

        <button type="submit" className={`submit-button${isSubmitting ? " is-loading" : ""}`} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="submit-loading" aria-live="polite">
              <span className="loading-dots" aria-hidden="true">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </span>
              <span>{loadingText}</span>
            </span>
          ) : (
            submitText
          )}
        </button>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
      </form>

      <button type="button" className="forgot-button" onClick={onForgotPassword} disabled={isSubmitting}>
        {forgotText}
      </button>
    </section>
  );
}

export default LoginCard;
