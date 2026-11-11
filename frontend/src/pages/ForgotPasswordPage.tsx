
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import authService from "../services/authService";

type ResetStep = "email" | "otp" | "password";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      await authService.forgotPassword({
        email: normalizedEmail,
      });

      setEmail(normalizedEmail);
      setStep("otp");

      setSuccess(
        "If an active account exists for this email, a password reset OTP has been sent."
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid six-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyResetOtp({
        email,
        otp,
      });

      setStep("password");
      setSuccess(response.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setError("Password cannot exceed 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        otp,
        newPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: response.message,
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-6 flex justify-center">
          <div className="rounded-xl bg-blue-600 p-3 text-white">
            <ShoppingBag size={30} />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-slate-900">
          Reset Password
        </h1>

        <p className="mb-7 mt-2 text-center text-slate-500">
          Recover access to your ShopSphere account
        </p>

        <div className="mb-7 flex items-center justify-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              step === "email"
                ? "bg-blue-600 text-white"
                : "bg-green-100 text-green-700"
            }`}
          >
            {step === "email" ? "1" : <CheckCircle size={20} />}
          </div>

          <div className="h-1 w-8 rounded bg-slate-200" />

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              step === "otp"
                ? "bg-blue-600 text-white"
                : step === "password"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200 text-slate-500"
            }`}
          >
            {step === "password" ? (
              <CheckCircle size={20} />
            ) : (
              "2"
            )}
          </div>

          <div className="h-1 w-8 rounded bg-slate-200" />

          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              step === "password"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            3
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Registered Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your registered email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Six-Digit OTP
              </label>

              <div className="relative">
                <ShieldCheck
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter your OTP"
                  required
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-center tracking-[0.4em] outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Check your email: {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-sm font-semibold text-blue-600 hover:underline"
            >
              Change Email Address
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                New Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Confirm New Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-7 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPasswordPage;
