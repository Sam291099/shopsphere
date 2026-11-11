
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import authService from "../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"register" | "verify">("register");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      await authService.register({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password,
      });

      setEmail(normalizedEmail);
      setStep("verify");
      setOtp("");
      setResendSeconds(60);

      setSuccess(
        "A verification OTP has been sent to your email address."
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
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
      await authService.verifyOtp({
        email,
        otp,
      });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Email verified successfully! Your account has been created. Please sign in.",
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await authService.resendOtp(email);

      setOtp("");
      setResendSeconds(60);
      setSuccess(response.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Unable to resend OTP. Please try again."
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
          {step === "register"
            ? "Create Account"
            : "Verify Your Email"}
        </h1>

        <p className="mb-8 mt-2 text-center text-slate-500">
          {step === "register"
            ? "Join ShopSphere today"
            : "We've sent a six-digit OTP to your email"}
        </p>

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

        {step === "register" ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email Address
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
                  placeholder="Enter your email"
                  required
                  maxLength={150}
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
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
                Confirm Password
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
                  placeholder="Confirm your password"
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
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-center">
              <ShieldCheck
                size={42}
                className="mx-auto mb-3 text-blue-600"
              />

              <p className="text-sm text-slate-600">
                Verification code sent to:
              </p>

              <p className="mt-1 break-all font-semibold text-slate-900">
                {email}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Six-Digit OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter OTP"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <div className="text-center text-sm text-slate-600">
              {resendSeconds > 0 ? (
                <p>
                  Resend OTP in{" "}
                  <span className="font-semibold text-blue-600">
                    {resendSeconds}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleResendOtp()}
                  disabled={loading}
                  className="font-semibold text-blue-600 hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setStep("register");
                setOtp("");
                setError("");
                setSuccess("");
              }}
              className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to registration
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-blue-600"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
