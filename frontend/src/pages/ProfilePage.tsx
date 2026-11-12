
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  CalendarDays,
  Hash,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import userService, { type UserProfile } from "../services/userService";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await userService.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error("Profile loading failed:", err);
        setError("Unable to load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">
          Loading your profile...
        </span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
        <h2 className="text-lg font-semibold text-gray-900">
          Profile unavailable
        </h2>
        <p className="mt-2 text-sm text-red-600">
          {error || "Profile information could not be loaded."}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="mt-2 text-gray-500">
            View your personal information and account details.
          </p>
        </div>

        {/* Profile Header */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-700 shadow-lg">
                <User className="h-10 w-10" />
              </div>

              <div className="text-center text-white sm:text-left">
                <h2 className="text-2xl font-bold">
                  {profile.fullName}
                </h2>
                <p className="mt-1 text-blue-100">
                  {profile.email}
                </p>
                <span className="mt-3 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-6 sm:p-8">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              Account Information
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">

              <div className="flex items-start gap-3">
                <Hash className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Customer ID</p>
                  <p className="mt-1 font-medium text-gray-900">
                    #{profile.id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profile.fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="mt-1 break-all font-medium text-gray-900">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Account Role</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profile.role}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {profile.active ? (
                  <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profile.active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {profile.emailVerified ? (
                  <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm text-gray-500">Email Verification</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {profile.emailVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <CalendarDays className="mt-1 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Thank you for being a part of ShopSphere!
        </p>

      </div>
    </div>
  );
}
