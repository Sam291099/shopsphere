
import { ShoppingCart, Package } from "lucide-react";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {

  const inStock = product.stockQuantity > 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200">

        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm transition duration-500 group-hover:scale-110">
          <Package size={42} className="text-zinc-400" />
        </div>

        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
          {inStock ? "Available" : "Out of stock"}
        </span>

      </div>

      <div className="p-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">
          {product.sku}
        </p>

        <h3 className="mt-2 text-lg font-bold text-zinc-900">
          {product.name}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-500">
          {product.description || "Explore this product from ShopSphere."}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">

          <div>
            <p className="text-xs text-zinc-400">Price</p>
            <p className="text-xl font-black text-zinc-900">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2,
              }).format(product.price)}
            </p>
          </div>

          <button
            disabled={!product.active || !inStock}
            onClick={() => onAddToCart(product)}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            <ShoppingCart size={17} />
            Add
          </button>

        </div>

        <p className="mt-4 text-xs text-zinc-400">
          {product.stockQuantity} units in stock
        </p>

      </div>
    </article>
  );
}
