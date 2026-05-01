"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Role = "donor" | "ngo" | "admin";

const roleConfig = {
  donor: { label: "Donor", href: "/donor/dashboard" },
  ngo: { label: "NGO / Recipient", href: "/ngo/dashboard" },
  admin: { label: "Admin", href: "/admin/dashboard" },
};

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<Role>("donor");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const actualRole = userDoc.data().role as Role;
        localStorage.setItem("userRole", actualRole);
        router.push(roleConfig[actualRole].href);
      } else {
        // Fallback if no role found
        localStorage.setItem("userRole", activeRole);
        router.push(roleConfig[activeRole].href);
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let finalRole = activeRole;
      
      if (userDoc.exists()) {
        finalRole = userDoc.data().role as Role || activeRole;
      } else {
        // If they don't exist, create a new document with the selected role
        await setDoc(userDocRef, {
          name: user.displayName || "Google User",
          email: user.email,
          role: activeRole,
          createdAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem("userRole", finalRole);
      router.push(roleConfig[finalRole].href);
      
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        // User closed the popup, no need to show an error or log it heavily
        console.log("Google sign-in popup closed by user.");
      } else {
        console.error(err);
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center p-6 min-h-screen bg-gradient-to-br from-[#e2e8f8] via-[#f9f9ff] to-[#f9f9ff]">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#10b981]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-80 h-80 bg-[#0058be]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#006c49]/5 rounded-full blur-3xl" />
      </div>


      <div className="w-full max-w-[440px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#10b981] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
            <span className="material-symbols-outlined text-white text-2xl">restaurant</span>
          </div>
          <h1 className="text-2xl font-black text-[#151c27]">Food Bridge</h1>
          <p className="text-sm text-gray-500 mt-1">Connecting surplus food to those in need.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl shadow-gray-200/60">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#151c27] mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500">Please enter your details to sign in.</p>
          </div>

          {/* Role Toggle */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
              I am a...
            </label>
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50 gap-1">
              {(Object.keys(roleConfig) as Role[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    activeRole === role
                      ? "bg-white shadow-sm text-[#006c49] ring-1 ring-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {roleConfig[role].label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#151c27] mb-2" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-transparent focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] text-sm transition-all outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-[#151c27]" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-[#006c49] font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-transparent focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] text-sm transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#006c49] transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#10b981] text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-500/20 hover:brightness-95 active:scale-[0.98] transition-all duration-150 disabled:opacity-70"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-gray-200" />
                <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-widest font-semibold">or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white text-[#151c27] font-semibold text-sm py-3.5 rounded-xl hover:bg-gray-50 transition-colors duration-150 disabled:opacity-70"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#006c49] font-bold hover:underline ml-1">
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex justify-between items-center px-4 opacity-50 hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="text-xs font-semibold">Secure Logistics</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
            <span className="text-xs font-semibold">Community Driven</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">eco</span>
            <span className="text-xs font-semibold">Zero Waste</span>
          </div>
        </div>
      </div>
    </main>
  );
}
