
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[#171717] text-white"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 md:py-28 lg:px-8">

        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
            Welcome to ShopSphere
          </span>

          <h1 className="mt-7 text-5xl font-black leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Find your
            <span className="block text-orange-400">
              next favorite.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
            Discover quality products, explore new collections
            and enjoy a better shopping experience.
          </p>

          <a
            href="#products"
            className="mt-9 inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 font-semibold text-white transition hover:bg-orange-600"
          >
            Explore products
            <ArrowRight size={19} />
          </a>

          <div className="mt-12 flex items-center gap-3 text-sm text-zinc-400">
            <ShoppingBag size={18} className="text-orange-400" />
            Your everyday shopping destination
          </div>
        </div>

        <div className="relative flex min-h-64 items-center justify-center md:min-h-96">
          <div className="absolute h-72 w-72 rounded-full bg-orange-500/20 blur-3xl md:h-96 md:w-96" />

          <div className="relative rotate-[-5deg] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm md:p-12">
            <div className="text-sm font-semibold uppercase tracking-widest text-orange-300">
              ShopSphere
            </div>

            <div className="mt-6 text-7xl md:text-9xl">
              ✦
            </div>

            <div className="mt-6 text-2xl font-bold">
              Shop better.
            </div>

            <div className="mt-2 text-sm text-zinc-400">
              Discover more every day.
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
