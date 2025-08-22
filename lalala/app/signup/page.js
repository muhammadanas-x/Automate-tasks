"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"

export default function SignupPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Client-side validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy")
      setLoading(false)
      return
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`

    try {
      const result = await register(fullName, email.trim(), password)
      if (result.success) {
        // Redirect to login page with success message
        router.push("/login?message=Account created successfully! Please sign in.")
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50/80 to-pink-50/60"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/40 via-transparent to-cyan-50/30"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-rose-50/20 to-orange-50/40"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-gradient-to-br from-violet-400/30 via-purple-500/25 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/25 via-cyan-500/30 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-rose-300/20 via-pink-400/25 to-orange-400/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-gradient-to-bl from-emerald-300/20 via-green-400/15 to-lime-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full opacity-60 animate-bounce delay-300"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full opacity-50 animate-bounce delay-700"></div>
        <div className="absolute bottom-1/3 left-2/3 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-40 animate-bounce delay-1000"></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between p-6 animate-slide-down">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-violet-900 via-purple-800 to-pink-700 bg-clip-text text-transparent">
            TrelloAI
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-violet-700 hover:bg-violet-50/50 transition-all duration-300"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/90 border-white/40 shadow-2xl animate-fade-in-up delay-300 hover:shadow-3xl transition-all duration-500">
          <CardHeader className="space-y-1 text-center animate-fade-in delay-500">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-900 via-purple-800 to-pink-700 bg-clip-text text-transparent">
              Create your account
            </CardTitle>
            <CardDescription className="text-gray-600">Join TrelloAI and transform your productivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 animate-fade-in delay-700">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md border border-red-200 animate-shake">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="bg-white/70 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300 hover:bg-white/80"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="bg-white/70 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300 hover:bg-white/80"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="bg-white/70 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300 hover:bg-white/80"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password (min 6 characters)"
                  className="bg-white/70 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300 hover:bg-white/80"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  minLength={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-white/70 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 transition-all duration-300 hover:bg-white/80"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 rounded focus:ring-violet-500"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={loading}
                  required
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-violet-600 hover:text-violet-800 transition-colors duration-200">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-violet-600 hover:text-violet-800 transition-colors duration-200"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200"
              >
                Sign in
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
        
        .delay-300 {
          animation-delay: 0.3s;
          animation-fill-mode: both;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
          animation-fill-mode: both;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}
