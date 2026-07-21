import React, { useState } from "react";
import logoLogin from "../assets/SATYATECH-LOGO-LOGIN.svg";

function LoginCard({
  onSubmit,
  isSubmitting = false,
  errorMessage = "",
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
    <div className="satyatech-login-container">
      <div className="login-left">
        <div className="login-form-wrapper">
          <div className="satyatech-small-logo">
            <img src={logoLogin} alt="Satyatech Logo" width="48" height="48" />
          </div>
          <h1>Welcome to Satyatech</h1>
          <p className="subtitle">Enter your credential to sign to your account</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email Address <span className="required">*</span></label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password <span className="required">*</span></label>
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
            </div>

            {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

            <button type="submit" className={`submit-button${isSubmitting ? " is-loading" : ""}`} disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <button type="button" className="forgot-button" disabled={isSubmitting}>
            Forgot Password?
          </button>
        </div>
      </div>
      <div className="login-right">
        <div className="branding-content">
          <div className="large-logo">
            <img src={logoLogin} alt="Satyatech Logo" width="240" />
          </div>
          <div className="quote-block">
            <p>“Take care of your body. It's the only place you have to live.”</p>
            <span className="quote-author">— Jim Rohn —</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginCard;
