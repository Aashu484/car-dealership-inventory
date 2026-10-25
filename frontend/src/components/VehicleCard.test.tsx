import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VehicleCard } from "./VehicleCard";
import { Vehicle } from "../types";

const vehicle: Vehicle = {
  id: 1,
  make: "Ford",
  model: "F-150",
  category: "Truck",
  price: 45500,
  quantity: 0,
};

describe("VehicleCard", () => {
  it("disables purchase when quantity is zero", () => {
    render(
      <VehicleCard
        vehicle={vehicle}
        isAdmin={false}
        onPurchase={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: /out of stock/i })).toBeDisabled();
  });

  it("purchases an in-stock vehicle", async () => {
    const onPurchase = vi.fn();
    render(
      <VehicleCard
        vehicle={{ ...vehicle, quantity: 2 }}
        isAdmin={false}
        onPurchase={onPurchase}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /purchase/i }));
    expect(onPurchase).toHaveBeenCalledWith(1);
  });

  it("shows admin actions only for admins", () => {
    const { rerender } = render(
      <VehicleCard vehicle={{ ...vehicle, quantity: 2 }} isAdmin={false} />,
    );
    expect(screen.queryByRole("button", { name: /delete/i })).not.toBeInTheDocument();

    rerender(
      <VehicleCard vehicle={{ ...vehicle, quantity: 2 }} isAdmin onDelete={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });
});
