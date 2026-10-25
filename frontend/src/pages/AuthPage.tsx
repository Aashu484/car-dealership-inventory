import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AuthPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/70 shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center lg:block">
          <div className="flex h-full flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-10">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Apex Motors</p>
            <h1 className="mt-3 text-4xl font-extrabold">Inventory that feels like a showroom.</h1>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Welcome</p>
          <h2 className="mt-2 text-3xl font-extrabold">
            {mode === "login" ? "Sign in to browse stock" : "Create your buyer account"}
          </h2>
          <p className="mt-3 text-slate-400">
            Demo admin: admin@dealership.local / Admin123! · Buyer: buyer@dealership.local / Buyer123!
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-xl px-4 py-2 font-semibold ${mode === "login" ? "bg-orange-600" : "text-slate-300"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-xl px-4 py-2 font-semibold ${mode === "register" ? "bg-orange-600" : "text-slate-300"}`}
            >
              Register
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            {mode === "register" ? (
              <label className="block text-sm">
                Full name
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            ) : null}
            <label className="block text-sm">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              Password
              <input
                type="password"
                minLength={8}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-orange-600 px-4 py-3 font-semibold disabled:opacity-60"
            >
              {busy ? "Please wait..." : mode === "login" ? "Enter showroom" : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
