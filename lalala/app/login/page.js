"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const searchParams = useSearchParams()

  // Check for success message from signup
  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setSuccess(message)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required")
      setLoading(false)
      return
    }

    try {
      const result = await login(email.trim(), password)
      if (!result.success) {
        setError(result.message)
      }
      // If successful, the useAuth hook will handle the redirect to dashboard
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-50/80 via-transparent to-amber-50/80"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100/40 via-transparent to-transparent"></div>

      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orbs */}
        <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-violet-400/30 via-purple-500/25 to-fuchsia-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-gradient-to-tr from-emerald-400/25 via-teal-500/20 to-cyan-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-bl from-rose-400/20 via-pink-500/15 to-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 -left-32 w-80 h-80 bg-gradient-to-tr from-amber-400/20 via-orange-500/15 to-yellow-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

        {/* Medium floating elements */}
        <div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-300/30 to-indigo-400/25 rounded-full blur-2xl animate-bounce delay-300"
          style={{ animationDuration: "6s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-green-300/25 to-emerald-400/20 rounded-full blur-xl animate-bounce delay-1000"
          style={{ animationDuration: "8s" }}
        ></div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r from-white/40 to-white/20 rounded-full animate-bounce`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between p-6 animate-slide-down">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-violet-900 bg-clip-text text-transparent">
            TrelloAI
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/signup">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-purple-700 hover:bg-white/50 transition-all duration-300"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/90 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-fade-in-up">
          <CardHeader className="space-y-1 text-center animate-fade-in delay-200">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-violet-900 via-purple-800 to-fuchsia-900 bg-clip-text text-transparent">
              Welcome back
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">Sign in to your TrelloAI account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 animate-fade-in delay-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-red-700 text-sm text-center p-3 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200/50 animate-shake">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-700 text-sm text-center p-3 bg-green-50/80 backdrop-blur-sm rounded-lg border border-green-200/50 animate-fade-in">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-800">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/70 backdrop-blur-sm border-gray-200/50 focus:border-violet-400 focus:ring-violet-400/30 focus:ring-4 transition-all duration-300 h-12 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-800">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-white/70 backdrop-blur-sm border-gray-200/50 focus:border-violet-400 focus:ring-violet-400/30 focus:ring-4 transition-all duration-300 h-12 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-violet-600 bg-white/70 border-gray-300 rounded focus:ring-violet-500 focus:ring-2"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700 font-medium">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-700 pt-2">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-violet-600 hover:text-violet-800 font-semibold transition-colors duration-200"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}
