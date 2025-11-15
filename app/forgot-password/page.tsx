"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Key, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import logo from "../../public/logo.png";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [errors, setErrors] = useState<{ email?: string; otp?: string; newPassword?: string; confirmPassword?: string }>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateEmail = () => {
    const newErrors: { email?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors: { otp?: string } = {};
    if (!otp) newErrors.otp = "OTP is required";
    else if (otp.length !== 6) newErrors.otp = "OTP must be 6 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword) newErrors.newPassword = "New password is required";
    else if (newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("OTP sent to your email");
        setStep("otp");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOtp()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (res.ok) {
        toast.success("OTP verified successfully");
        setStep("reset");
      } else {
        const data = await res.json();
        toast.error(data.error || "Invalid OTP. Please try again.");
        setErrors({ otp: data.error || "Invalid OTP" });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      if (res.ok) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reset password. Please try again.");
        setErrors({ newPassword: data.error || "Failed to reset password" });
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-fast"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-fast animation-delay-1000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob-fast animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-fast animation-delay-3000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob-fast animation-delay-4000"></div>
        <div className="absolute top-1/4 right-1/2 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-55 animate-blob-fast animation-delay-5000"></div>
        <div className="absolute bottom-1/2 left-1/2 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-65 animate-blob-fast animation-delay-6000"></div>
      </div>

      <Card className={`w-full max-w-md relative z-10 transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
      } shadow-2xl hover:shadow-3xl backdrop-blur-sm bg-white/90`}>
        <CardHeader className="space-y-0 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center relative animate-pulse">
              <Image src={logo} alt="" fill style={{ objectFit: "contain" }} />
            </div>
          </div>

          <CardTitle className="text-3xl font-bold text-center tracking-wide leading-tight mb-2">
            <span className="bg-gradient-to-b from-[#fa2b57] to-[#fb7737] bg-clip-text text-transparent uppercase animate-gradient-x">City</span>
            <span className="text-[#00b3fe] uppercase animate-gradient-x animation-delay-1000">Witty</span>
            <br />
            <span className="text-gray-600 uppercase text-xl block mt-1 animate-fade-in animation-delay-2000">ADMIN</span>
          </CardTitle>

          <CardDescription className="text-center mt-2 text-base animate-fade-in animation-delay-3000">
            {step === "email" ? "Enter your email to reset password" :
             step === "otp" ? "Enter the OTP sent to your email" :
             "Enter your new password"}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-3 animate-fade-in animation-delay-4000">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-blue-500 transition-colors duration-200" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@citywitty.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-12 h-12 text-base transition-all duration-200 hover:shadow-md focus:shadow-lg ${
                      errors.email ? "border-red-500 focus:border-red-500" : "focus:border-blue-400"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm animate-shake">{errors.email}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#3A98EF] hover:to-[#EF6A00] transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in animation-delay-5000"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          ) : step === "otp" ? (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {/* OTP */}
              <div className="space-y-3 animate-fade-in animation-delay-4000">
                <Label htmlFor="otp" className="text-sm font-medium">OTP</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-orange-500 transition-colors duration-200" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={`pl-12 h-12 text-base transition-all duration-200 hover:shadow-md focus:shadow-lg ${
                      errors.otp ? "border-red-500 focus:border-red-500" : "focus:border-orange-400"
                    }`}
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm animate-shake">{errors.otp}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#3A98EF] hover:to-[#EF6A00] transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in animation-delay-5000"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {/* New Password */}
              <div className="space-y-3 animate-fade-in animation-delay-4000">
                <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-orange-500 transition-colors duration-200" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`pl-12 pr-12 h-12 text-base transition-all duration-200 hover:shadow-md focus:shadow-lg ${
                      errors.newPassword ? "border-red-500 focus:border-red-500" : "focus:border-orange-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm animate-shake">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-3 animate-fade-in animation-delay-5000">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-orange-500 transition-colors duration-200" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-12 pr-12 h-12 text-base transition-all duration-200 hover:shadow-md focus:shadow-lg ${
                      errors.confirmPassword ? "border-red-500 focus:border-red-500" : "focus:border-orange-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm animate-shake">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Reset Password Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#3A98EF] hover:to-[#EF6A00] transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in animation-delay-6000"
                disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 animate-fade-in animation-delay-6000">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob-fast {
          animation: blob 4s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        @keyframes fade-in {
          to {
            opacity: 1;
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}