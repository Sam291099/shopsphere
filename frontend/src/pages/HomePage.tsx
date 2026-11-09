
import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, ShoppingCart, Minus, Plus, Trash2, X } from "lucide-react";

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

  // Shopping cart: product ID and quantity
  const [cart, setCart] = useState<Record<number, number>>(() => {
  try {
    const savedCart = localStorage.getItem("shopsphere-cart");

    return savedCart ? JSON.parse(savedCart) : {};
  } catch (error) {
    console.error("Unable to restore shopping cart:", error);
    return {};
  }
});
  const [showCart, setShowCart] = useState(false);

  // Load products from backend
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
  useEffect(() => {
  localStorage.setItem("shopsphere-cart", JSON.stringify(cart));
}, [cart]);
  // Filter products based on search and availability
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.description ?? "").toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "available" &&
          product.active &&
          product.stockQuantity > 0) ||
        (filter === "unavailable" &&
          (!product.active || product.stockQuantity === 0));

      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, filter]);

  // Add product to cart
  const addToCart = (product: Product) => {
    if (!product.active || product.stockQuantity <= 0) return;

    setCart((current) => {
      const currentQuantity = current[product.id] || 0;

      if (currentQuantity >= product.stockQuantity) {
        return current;
      }

      return {
        ...current,
        [product.id]: currentQuantity + 1,
      };
    });
  };

  // Increase product quantity
  const increaseQuantity = (product: Product) => {
    addToCart(product);
  };

  // Decrease product quantity
  const decreaseQuantity = (productId: number) => {
    setCart((current) => {
      const quantity = current[productId] || 0;

      if (quantity <= 1) {
        const updatedCart = { ...current };
        delete updatedCart[productId];
        return updatedCart;
      }

      return {
        ...current,
        [productId]: quantity - 1,
      };
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: number) => {
    setCart((current) => {
      const updatedCart = { ...current };
      delete updatedCart[productId];
      return updatedCart;
    });
  };

  // Get products currently in cart
  const cartItems = useMemo(() => {
    return products.filter((product) => (cart[product.id] || 0) > 0);
  }, [products, cart]);

  // Calculate total cart quantity
  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  // Calculate subtotal
  const cartSubtotal = cartItems.reduce(
    (total, product) =>
      total + product.price * (cart[product.id] || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">

      {/* Navigation */}
      <Navbar
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setShowCart(true)}
      />

      {/* Hero section */}
      <Hero />

      {/* Shopping Cart Section */}
      <section className="mx-auto max-w-7xl px-5 pt-8 lg:px-8">

        <div className="flex justify-end">
          <button
            onClick={() => setShowCart(!showCart)}
            className="flex items-center gap-3 rounded-full bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-orange-500"
          >
            <ShoppingCart size={19} />
            <span>Shopping Cart</span>

            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs">
              {cartCount}
            </span>
          </button>
        </div>

        {showCart && (
        <div
         id="shopping-cart-panel"
         className="relative z-40 mt-6 rounded-2xl border-2 border-orange-200 bg-white p-6 shadow-2xl"
        >

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-zinc-900">
                Your Shopping Cart
              </h2>

              <button
                onClick={() => setShowCart(false)}
                className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100"
                aria-label="Close cart"
              >
                <X size={22} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart
                  size={42}
                  className="mx-auto text-zinc-300"
                />

                <p className="mt-4 font-semibold text-zinc-700">
                  Your cart is empty
                </p>

                <p className="mt-2 text-sm text-zinc-500">
                  Add some products to start shopping!
                </p>
              </div>
            ) : (
              <div className="space-y-5">

                {cartItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-5"
                  >

                    <div className="min-w-[140px] flex-1">
                      <h3 className="font-bold text-zinc-900">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        ${product.price.toFixed(2)} each
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        SKU: {product.sku}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">

                      <button
                        onClick={() => decreaseQuantity(product.id)}
                        className="rounded-lg border border-zinc-200 p-2 transition hover:bg-zinc-100"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="min-w-6 text-center font-semibold">
                        {cart[product.id]}
                      </span>

                      <button
                        onClick={() => increaseQuantity(product)}
                        disabled={
                          cart[product.id] >= product.stockQuantity
                        }
                        className="rounded-lg border border-zinc-200 p-2 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus size={15} />
                      </button>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="ml-2 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        aria-label="Remove product"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                    <div className="w-full text-right font-bold text-zinc-900 sm:w-auto">
                      ${(product.price * cart[product.id]).toFixed(2)}
                    </div>

                  </div>
                ))}

                {/* Cart subtotal */}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-lg font-bold text-zinc-900">
                    Subtotal
                  </span>

                  <span className="text-2xl font-black text-orange-500">
                    ${cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <p className="text-right text-xs text-zinc-400">
                  Shipping and taxes calculated at checkout.
                </p>

                <button
                  onClick={() =>
                    alert("Checkout functionality will be added soon!")
                  }
                  className="w-full rounded-xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600"
                >
                  Proceed to Checkout
                </button>

              </div>
            )}

          </div>
        )}

      </section>

      {/* Products Section */}
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

        {/* Product loading, errors and results */}
        <div className="mt-10">

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw
                className="animate-spin text-orange-500"
                size={32}
              />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="font-semibold text-red-700">
                {error}
              </p>

              <button
                onClick={loadProducts}
                className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white py-20 text-center">

              <Search
                className="mx-auto text-zinc-400"
                size={35}
              />

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

      {/* Footer */}
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
