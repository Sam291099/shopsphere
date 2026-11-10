
import { ShoppingBag, Search, Menu, LogOut, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

interface NavbarProps {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCartClick: () => void;
}

export default function Navbar({
  cartCount,
  searchQuery,
  onSearchChange,
  onCartClick,
}: NavbarProps) {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">

        <Link to="/" className="text-2xl font-black tracking-tight">
          shop<span className="text-orange-500">sphere.</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-zinc-600 md:flex">
          <a href="#home" className="hover:text-orange-500">Home</a>
          <a href="#products" className="hover:text-orange-500">Shop</a>
          <a href="#about" className="hover:text-orange-500">About</a>

          {user?.role === "ADMIN" && (
            <Link to="/admin/orders" className="hover:text-orange-500">
              Admin Orders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">

          <div className="hidden items-center rounded-full bg-zinc-100 px-4 py-2 sm:flex">
            <Search size={17} className="text-zinc-500" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-36 bg-transparent pl-2 text-sm outline-none lg:w-48"
            />
          </div>

          <button
            type="button"
            onClick={onCartClick}
            aria-label="Shopping cart"
            className="relative z-50 rounded-full p-2 hover:bg-zinc-100"
          >
            <ShoppingBag size={21} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <UserCircle size={20} className="text-zinc-600" />

              <span className="max-w-28 truncate text-sm font-medium text-zinc-700">
                {user.fullName}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-orange-500"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:text-orange-500"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Register
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg p-2 hover:bg-zinc-100 md:hidden"
          >
            <Menu size={22} />
          </button>

        </div>
      </div>

      <div className="border-t border-zinc-100 px-5 py-2 sm:hidden">
        <input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-full bg-zinc-100 px-4 py-2 text-sm outline-none"
        />
      </div>
    </header>
  );
}
