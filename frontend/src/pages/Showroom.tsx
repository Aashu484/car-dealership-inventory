import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/client";
import { VehicleCard } from "../components/VehicleCard";
import { useAuth } from "../context/AuthContext";
import { SearchFilters, Vehicle } from "../types";

const emptyFilters: SearchFilters = {
  make: "",
  model: "",
  category: "",
  minPrice: "",
  maxPrice: "",
};

const emptyForm = {
  make: "",
  model: "",
  category: "Sedan",
  price: "",
  quantity: "",
};

export function Showroom() {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isAdmin = user?.role === "admin";

  async function load(nextFilters = filters) {
    const data = await api.searchVehicles(nextFilters);
    setVehicles(data);
  }

  useEffect(() => {
    if (!user) return;
    load().catch((err: Error) => setError(err.message));
    // Initial inventory fetch only; search is explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function flash(message: string) {
    setNotice(message);
    setError("");
  }

  async function onSearch(event: FormEvent) {
    event.preventDefault();
    try {
      await load(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    }
  }

  async function onPurchase(id: number) {
    try {
      await api.purchase(id);
      await load();
      flash("Purchase complete. Title paperwork is next.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    }
  }

  async function onDelete(id: number) {
    if (!window.confirm("Delete this vehicle from inventory?")) return;
    try {
      await api.deleteVehicle(id);
      await load();
      flash("Vehicle removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function onRestock(id: number) {
    const raw = window.prompt("How many units should we add?", "1");
    const quantity = Number(raw);
    if (!raw || Number.isNaN(quantity) || quantity < 1) return;
    try {
      await api.restock(id, quantity);
      await load();
      flash("Stock updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Restock failed");
    }
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    const payload = {
      make: form.make,
      model: form.model,
      category: form.category,
      price: Number(form.price),
      quantity: Number(form.quantity),
    };
    try {
      if (editing) {
        await api.updateVehicle(editing.id, payload);
        flash("Vehicle updated.");
      } else {
        await api.createVehicle(payload);
        flash("Vehicle added to the lot.");
      }
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  function startEdit(vehicle: Vehicle) {
    setEditing(vehicle);
    setForm({
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: String(vehicle.price),
      quantity: String(vehicle.quantity),
    });
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-900/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-orange-300">Apex Motors</p>
          <h1 className="text-3xl font-extrabold">Live dealership inventory</h1>
          <p className="text-slate-400">
            Signed in as {user.name} · {user.role === "admin" ? "Administrator" : "Buyer"}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-2xl border border-white/15 px-4 py-2 font-semibold hover:bg-white/10"
        >
          Log out
        </button>
      </header>

      <form
        onSubmit={onSearch}
        className="mt-6 grid gap-3 rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 md:grid-cols-6"
      >
        <input
          placeholder="Make"
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
          value={filters.make}
          onChange={(e) => setFilters({ ...filters, make: e.target.value })}
        />
        <input
          placeholder="Model"
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
          value={filters.model}
          onChange={(e) => setFilters({ ...filters, model: e.target.value })}
        />
        <input
          placeholder="Category"
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        />
        <input
          placeholder="Min price"
          type="number"
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
        />
        <input
          placeholder="Max price"
          type="number"
          className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />
        <button type="submit" className="rounded-2xl bg-sky-600 px-4 py-3 font-semibold hover:bg-sky-500">
          Search
        </button>
      </form>

      {error ? <p className="mt-4 text-rose-300">{error}</p> : null}
      {notice ? <p className="mt-4 text-emerald-300">{notice}</p> : null}

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            isAdmin={isAdmin}
            onPurchase={onPurchase}
            onEdit={startEdit}
            onDelete={onDelete}
            onRestock={onRestock}
          />
        ))}
      </section>

      {vehicles.length === 0 ? (
        <p className="mt-10 text-center text-slate-400">No vehicles match those filters.</p>
      ) : null}

      {isAdmin ? (
        <form
          onSubmit={onSave}
          className="mt-10 rounded-[2rem] border border-orange-500/20 bg-slate-900/70 p-6"
        >
          <h2 className="text-2xl font-bold">{editing ? "Update vehicle" : "Add a vehicle"}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <input
              required
              placeholder="Make"
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
            />
            <input
              required
              placeholder="Model"
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
            <input
              required
              placeholder="Category"
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Price"
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Qty"
              className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-2xl bg-orange-600 px-5 py-3 font-semibold">
              {editing ? "Save changes" : "Add to inventory"}
            </button>
            {editing ? (
              <button
                type="button"
                className="rounded-2xl border border-white/15 px-5 py-3"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
