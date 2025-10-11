"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import logo from "../../public/logo.png";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [isVisible, setIsVisible] = useState(false);

  const router = useRouter();
  const { login, isLoading } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email";
    if (!password) newErrors.password = "Password is required";
    // else if (password.length < 6) newErrors.password = "Min 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await login(email, password);

    if (success) {
      toast.success("Welcome back Admin!");

      // Redirect after 2 seconds (2000 milliseconds)
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } else {
      toast.error("Invalid email or password");
      setErrors({ password: "Invalid credentials" });
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
            Sign in to access your admin dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Password */}
            <div className="space-y-3 animate-fade-in animation-delay-5000">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-hover:text-orange-500 transition-colors duration-200" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-12 pr-12 h-12 text-base transition-all duration-200 hover:shadow-md focus:shadow-lg ${
                    errors.password ? "border-red-500 focus:border-red-500" : "focus:border-orange-400"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm animate-shake">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#3A98EF] hover:to-[#EF6A00] transition-all duration-300 transform hover:scale-105 hover:shadow-xl animate-fade-in animation-delay-6000"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
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
