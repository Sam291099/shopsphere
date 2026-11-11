
import { useEffect, useState } from "react";
import {
  RefreshCw,
  Search,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";

import api from "../services/api";

interface OrderItem {
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

function statusStyle(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "PROCESSING":
      return "bg-purple-100 text-purple-700";
    case "SHIPPED":
      return "bg-orange-100 text-orange-700";
    case "DELIVERED":
      return "bg-green-100 text-green-700";
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // Shared API service automatically attaches the JWT token.
      const response = await api.get<Order[]>("/orders");

      setOrders(response.data);
    } catch (err) {
      console.error("Unable to load orders:", err);
      setError("Unable to load orders. Please check your login and backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const updateStatus = async (orderNumber: string, status: string) => {
    try {
      setUpdatingOrder(orderNumber);

      // Shared API service automatically attaches the JWT token.
      const response = await api.put<Order>(
        `/orders/${encodeURIComponent(orderNumber)}/status`,
        null,
        { params: { status } }
      );

      setOrders((current) =>
        current.map((order) =>
          order.orderNumber === orderNumber ? response.data : order
        )
      );

      setSelectedOrder((current) =>
        current?.orderNumber === orderNumber ? response.data : current
      );
    } catch (err) {
      console.error("Unable to update order status:", err);
      alert(
        "Unable to update order status. Please check your permissions and try again."
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = search.toLowerCase();

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerEmail.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((total, order) => total + Number(order.totalAmount), 0);

  const pendingCount = orders.filter(
    (order) => order.status === "PENDING"
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-zinc-900 px-6 py-6 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
              ShopSphere Admin
            </p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">
              Order Management
            </h1>
          </div>

          <button
            onClick={() => void loadOrders()}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold transition hover:bg-orange-600 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-500">
                Total Orders
              </p>
              <Package className="text-orange-500" />
            </div>
            <p className="mt-4 text-3xl font-black text-zinc-900">
              {orders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-500">
                Pending Orders
              </p>
              <Clock className="text-yellow-500" />
            </div>
            <p className="mt-4 text-3xl font-black text-zinc-900">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-500">
                Delivered
              </p>
              <CheckCircle className="text-green-500" />
            </div>
            <p className="mt-4 text-3xl font-black text-zinc-900">
              {deliveredCount}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-500">
                Non-cancelled Order Value
              </p>
              <Truck className="text-blue-500" />
            </div>
            <p className="mt-4 text-3xl font-black text-zinc-900">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h2 className="text-xl font-black text-zinc-900">
              Customer Orders
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search orders or customers"
                  className="w-full rounded-xl border border-zinc-200 py-3 pl-10 pr-4 outline-none focus:border-orange-500 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-orange-500"
              >
                <option value="ALL">All statuses</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw
                className="animate-spin text-orange-500"
                size={32}
              />
            </div>
          ) : error ? (
            <div className="mt-6 rounded-xl bg-red-50 p-5 text-center text-red-700">
              {error}
              <button
                onClick={() => void loadOrders()}
                className="ml-3 font-bold underline"
              >
                Try again
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-zinc-500">
              <Package size={40} className="mx-auto mb-4 text-zinc-300" />
              No orders found.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-4">Order</th>
                    <th className="px-4 py-4">Customer</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Total</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-zinc-100 hover:bg-zinc-50"
                    >
                      <td className="px-4 py-5 font-bold text-zinc-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-5">
                        <p className="font-semibold text-zinc-900">
                          {order.customerName}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {order.customerEmail}
                        </p>
                      </td>
                      <td className="px-4 py-5 text-sm text-zinc-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-5 font-bold text-zinc-900">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-500"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-orange-500">
                  ORDER DETAILS
                </p>
                <h2 className="mt-1 break-all text-xl font-black text-zinc-900">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"
                aria-label="Close order details"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-400">
                  Customer
                </p>
                <p className="mt-1 font-semibold text-zinc-900">
                  {selectedOrder.customerName}
                </p>
                <p className="text-sm text-zinc-500">
                  {selectedOrder.customerEmail}
                </p>
                <p className="text-sm text-zinc-500">
                  {selectedOrder.customerPhone}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-zinc-400">
                  Delivery Address
                </p>
                <p className="mt-1 text-sm text-zinc-700">
                  {selectedOrder.deliveryAddress}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-bold text-zinc-900">Ordered Items</h3>
              <div className="mt-3 space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="flex justify-between gap-4 border-b border-zinc-100 pb-3"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {item.productSku} · Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-zinc-900">
                      ${Number(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold text-zinc-700">Order Total</span>
              <span className="text-xl font-black text-orange-500">
                ${Number(selectedOrder.totalAmount).toFixed(2)}
              </span>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Update Order Status
              </label>
              <select
                value={selectedOrder.status}
                disabled={
                  updatingOrder === selectedOrder.orderNumber ||
                  selectedOrder.status === "DELIVERED" ||
                  selectedOrder.status === "CANCELLED"
                }
                onChange={(event) =>
                  void updateStatus(
                    selectedOrder.orderNumber,
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-orange-500 disabled:bg-zinc-100"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {updatingOrder === selectedOrder.orderNumber && (
                <p className="mt-2 text-sm text-orange-500">
                  Updating status...
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 w-full rounded-xl bg-zinc-900 py-3 font-bold text-white hover:bg-orange-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
