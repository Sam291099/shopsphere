
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";

import { productService } from "../services/productService";
import type { Product } from "../types/product";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const [cart, setCart] = useState<Record<number, number>>({});

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load products. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "available" && product.active && product.stockQuantity > 0) ||
        (filter === "unavailable" && (!product.active || product.stockQuantity === 0));

      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, filter]);

  const addToCart = (product: Product) => {
    setCart((current) => ({
      ...current,
      [product.id]: (current[product.id] || 0) + 1,
    }));
  };

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">

      <Navbar
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Hero />

      <main
        id="products"
        className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
      >

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Our collection
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
              Explore products
            </h2>

            <p className="mt-3 text-zinc-500">
              Discover products available in our store.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "All products", value: "all" },
              { label: "Available", value: "available" },
              { label: "Unavailable", value: "unavailable" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

        </div>

        <div className="mt-10">

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="animate-spin text-orange-500" size={32} />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-700">{error}</p>

              <button
                onClick={loadProducts}
                className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center">

              <Search className="mx-auto text-zinc-400" size={35} />

              <h3 className="mt-4 text-xl font-bold text-zinc-800">
                No products found
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Try another search or change the filter.
              </p>

            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}

        </div>

      </main>

      <footer
        id="about"
        className="border-t border-zinc-200 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-8 text-sm text-zinc-500 sm:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>

          <p>Shop better. Discover more.</p>
        </div>
      </footer>

    </div>
  );
}
