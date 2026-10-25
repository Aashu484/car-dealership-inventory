import { formatPrice } from "../lib/money";
import { Vehicle } from "../types";

type Props = {
  vehicle: Vehicle;
  isAdmin?: boolean;
  onPurchase?: (id: number) => void;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (id: number) => void;
  onRestock?: (id: number) => void;
};

export function VehicleCard({
  vehicle,
  isAdmin = false,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
}: Props) {
  const outOfStock = vehicle.quantity === 0;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20 backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-3">
        <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
          {vehicle.category}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            outOfStock ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300"
          }`}
        >
          {outOfStock ? "Out of stock" : `${vehicle.quantity} in stock`}
        </span>
      </div>

      <h3 className="text-2xl font-extrabold tracking-tight">
        {vehicle.make} {vehicle.model}
      </h3>
      <p className="mt-2 text-3xl font-bold text-orange-300">{formatPrice(vehicle.price)}</p>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => onPurchase?.(vehicle.id)}
          className="rounded-2xl bg-orange-600 px-4 py-3 font-semibold text-white transition enabled:hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {outOfStock ? "Out of stock" : "Purchase"}
        </button>

        {isAdmin ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(vehicle)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onRestock?.(vehicle.id)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
            >
              Restock
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(vehicle.id)}
              className="rounded-xl border border-rose-500/30 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
