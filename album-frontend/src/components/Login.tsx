import { type FormEvent, useState } from "react";
import heroImg from "../assets/hero.png";
import { useLoginMutation, useRegisterMutation } from "../store/api/auth";
import Notify from "./Notify";

type AuthMode = "login" | "register";

function Login() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const isRegister = authMode === "register";
  const [login, { isLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [notifyMessage, setNotifyMessage] = useState("");

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      let data: any;
      if (authMode === "login") {
        data = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        data = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
      }
      const message =
        (data as any)?.message ||
        (data as any)?.data?.message ||
        (data as any)?.error?.data?.message ||
        "Something went wrong";
      setAuthMode("login");
      setNotifyMessage(message);
      window.setTimeout(() => setNotifyMessage(""), 4000);
    } catch (err) {
      setNotifyMessage("Something went wrong");
      window.setTimeout(() => setNotifyMessage(""), 4000);
    }
  };

  return (
    <main className="auth-shell">
      <section className="brand-panel" aria-labelledby="brand-title">
        <nav className="brand-nav" aria-label="Album navigation">
          <a className="brand-mark" href="/" aria-label="Album home">
            <span className="brand-icon">A</span>
            <span>Album</span>
          </a>
        </nav>

        <div className="brand-copy">
          <p className="eyebrow">Private photo albums</p>
          <h1 id="brand-title">Keep every frame close.</h1>
          <p>
            Create personal albums, upload favorite photos, and return to the
            moments that matter.
          </p>
        </div>

        <div className="photo-scene" aria-hidden="true">
          <img src={heroImg} className="photo-stack" alt="" />
          <div className="photo-card photo-card-large"></div>
          <div className="photo-card photo-card-small"></div>
          <div className="photo-strip">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-card">
          <div className="auth-header">
            <p className="eyebrow">
              {isRegister ? "Create account" : "Welcome back"}
            </p>
            <h2 id="auth-title">{isRegister ? "Register" : "Login"}</h2>
          </div>

          <div className="auth-toggle" aria-label="Choose authentication form">
            <button
              type="button"
              className={isRegister ? "active" : ""}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
            <button
              type="button"
              className={!isRegister ? "active" : ""}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>
          </div>

          <form
            id="auth-form"
            className="auth-form"
            onSubmit={handleAuthSubmit}
          >
            {isRegister && (
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </label>
            )}

            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </label>

            <button
              className="primary-action"
              type="submit"
              disabled={isLoading || registerLoading}
            >
              {isRegister ? "Create album account" : "Login to album"}
            </button>
          </form>

          <p className="switch-copy">
            {isRegister ? "Already have an account?" : "New to Album?"}{" "}
            <button
              type="button"
              onClick={() => setAuthMode(isRegister ? "login" : "register")}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>
        </div>
      </section>
      {notifyMessage && <Notify message={notifyMessage} />}
    </main>
  );
}

export default Login;
