"use client";

import { useState } from "react";
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

  const router = useRouter();
  const { login, isLoading } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-0">
  <div className="flex items-center justify-center mb-0">
    <div className="w-12 h-12 flex items-center justify-center relative">
      <Image src={logo} alt="" fill style={{ objectFit: "contain" }} />
    </div>
  </div>

  <CardTitle className="text-2xl font-bold text-center tracking-wide leading-tight">
    <span className="bg-gradient-to-b from-[#fa2b57] to-[#fb7737] bg-clip-text text-transparent uppercase">City</span>
    <span className="text-[#00b3fe] uppercase">Witty</span>
    <br />
    <span className="text-gray-600 uppercase text-lg block mt-0.5">ADMIN</span>
  </CardTitle>

  <CardDescription className="text-center mt-1 text-sm">
    Sign in to access your admin dashboard
  </CardDescription>
</CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@citywitty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 pr-10 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4AA8FF] to-[#FF7A00] hover:from-[#3A98EF] hover:to-[#EF6A00]"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
