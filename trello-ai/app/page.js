import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 via-indigo-300/15 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-gradient-to-br from-rose-300/20 via-pink-300/15 to-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-[350px] h-[350px] bg-gradient-to-br from-cyan-300/15 via-blue-400/10 to-indigo-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-gradient-to-br from-violet-300/10 via-purple-300/15 to-fuchsia-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm bg-white/70 rounded-2xl mx-6 mt-4 shadow-lg border border-white/20">
        <div className="flex items-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            TrelloAI
          </div>
        </div>
        <div className="flex items-center space-x-8">
          <a
            href="#testimonials"
            className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105"
          >
            Testimonials
          </a>
          <a
            href="#contact"
            className="text-gray-600 hover:text-indigo-600 transition-all duration-300 font-medium hover:scale-105"
          >
            Contact
          </a>
          <Button
            variant="outline"
            className="rounded-full bg-white/50 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 hover:scale-105 transition-all duration-300"
          >
            Login
          </Button>
          <Button className="rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            Sign Up
          </Button>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center px-6 py-24 max-w-5xl mx-auto text-center">
        <div className="mb-6 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200/50">
          <span className="text-sm font-medium text-blue-700">✨ AI-Powered Project Management</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-6 leading-tight tracking-tight">
          Turn your ideas into organized projects
          <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            instantly
          </span>
        </h1>

        <p className="text-xl text-gray-600 mb-16 max-w-3xl leading-relaxed">
          AI-powered productivity that automates your Trello workflows. Just describe what you need, and watch your
          project come to life with intelligent task organization and smart automation.
        </p>

        <div className="w-full max-w-3xl">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <Input
              placeholder="Describe your project idea... (e.g., 'Create a marketing campaign for our new product launch with timeline and deliverables')"
              className="text-lg py-6 px-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50/80 rounded-2xl mb-6 placeholder:text-gray-400 hover:bg-gray-50 transition-all duration-300"
            />
            <Button
              size="lg"
              className="w-full py-6 text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <span className="group-hover:scale-105 transition-transform duration-300">Generate Project ✨</span>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-4xl">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart AI Analysis</h3>
            <p className="text-gray-600 text-sm">Understands context and creates detailed project structures</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Setup</h3>
            <p className="text-gray-600 text-sm">From idea to organized Trello board in seconds</p>
          </div>
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Perfect Organization</h3>
            <p className="text-gray-600 text-sm">Intelligent task prioritization and workflow optimization</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mt-20 max-w-5xl w-full">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              50K+
            </div>
            <p className="text-gray-600 text-sm">Projects Created</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              15K+
            </div>
            <p className="text-gray-600 text-sm">Happy Users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              98%
            </div>
            <p className="text-gray-600 text-sm">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <p className="text-gray-600 text-sm">AI Support</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to transform chaotic ideas into perfectly organized, actionable project plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Intelligent Task Breakdown</h3>
              <p className="text-gray-600 leading-relaxed">
                AI analyzes your project description and automatically creates detailed task lists with proper
                dependencies and timelines.
              </p>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Prioritization</h3>
              <p className="text-gray-600 leading-relaxed">
                Automatically prioritizes tasks based on urgency, dependencies, and impact to keep your team focused on
                what matters most.
              </p>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Board Creation</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate complete Trello boards with lists, cards, labels, and due dates in seconds, not hours.
              </p>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Workflow Automation</h3>
              <p className="text-gray-600 leading-relaxed">
                Set up intelligent automation rules that move cards, assign team members, and update statuses based on
                your workflow.
              </p>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Progress Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Get AI-powered insights on project progress, bottlenecks, and team performance with actionable
                recommendations.
              </p>
            </Card>

            <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                AI suggests optimal team member assignments based on skills, workload, and availability for maximum
                efficiency.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            See TrelloAI in Action
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Watch how a simple idea transforms into a complete project structure in real-time
          </p>

          <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-indigo-900 rounded-3xl p-8 shadow-2xl">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-white/70 text-sm">TrelloAI Demo</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-left">
                <div className="text-white/90 font-mono text-sm mb-2">Input:</div>
                <div className="text-blue-300 font-mono text-sm mb-4">
                  "Launch a new mobile app with marketing campaign, development phases, and user testing"
                </div>
                <div className="text-white/90 font-mono text-sm mb-2">AI Processing...</div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-green-400 font-semibold text-sm mb-2">📋 Development</div>
                    <div className="text-white/70 text-xs space-y-1">
                      <div>• UI/UX Design</div>
                      <div>• Frontend Development</div>
                      <div>• Backend API</div>
                      <div>• Testing & QA</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-blue-400 font-semibold text-sm mb-2">📢 Marketing</div>
                    <div className="text-white/70 text-xs space-y-1">
                      <div>• Brand Strategy</div>
                      <div>• Content Creation</div>
                      <div>• Social Media</div>
                      <div>• Launch Campaign</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-purple-400 font-semibold text-sm mb-2">👥 User Testing</div>
                    <div className="text-white/70 text-xs space-y-1">
                      <div>• Beta User Recruitment</div>
                      <div>• Feedback Collection</div>
                      <div>• Bug Fixes</div>
                      <div>• Performance Optimization</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Try the Demo →
            </Button>
          </div>
        </div>
      </section>

      <section id="testimonials" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 via-indigo-300/15 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-gradient-to-br from-rose-300/20 via-pink-300/15 to-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-[350px] h-[350px] bg-gradient-to-br from-cyan-300/15 via-blue-400/10 to-indigo-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-gradient-to-br from-violet-300/10 via-purple-300/15 to-fuchsia-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
            Loved by thousands of users
          </h2>
          <p className="text-xl text-gray-600">See what our community has to say</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
            <CardContent className="p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "TrelloAI transformed how I manage projects. What used to take hours of setup now happens in minutes.
                The AI truly understands what I need."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mr-4 flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform duration-300">
                  SC
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Chen</p>
                  <p className="text-sm text-gray-500">Product Manager at TechCorp</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
            <CardContent className="p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The AI understands exactly what I need. It's like having a project management assistant that never
                sleeps. Absolutely game-changing!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mr-4 flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform duration-300">
                  MR
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Marcus Rodriguez</p>
                  <p className="text-sm text-gray-500">Startup Founder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
            <CardContent className="p-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Our team productivity increased by 40% since we started using TrelloAI. The automation features are
                incredible and save us hours daily."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mr-4 flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform duration-300">
                  EW
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Emily Watson</p>
                  <p className="text-sm text-gray-500">Team Lead at InnovateLab</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Join thousands of teams who've revolutionized their project management with AI
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Trial</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  $0
                </div>
                <p className="text-gray-500 mb-6">14 days • No credit card required</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Up to 10 AI-generated projects
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Basic automation features
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Email support
                  </li>
                </ul>
                <Button className="w-full py-3 rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-300">
                  Start Free Trial
                </Button>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro Plan</h3>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  $29
                </div>
                <p className="text-gray-500 mb-6">per month • Billed annually</p>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Unlimited AI-generated projects
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Advanced automation & workflows
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Team collaboration features
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-3">✓</span>
                    Priority support & training
                  </li>
                </ul>
                <Button className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Get Started Now →
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="relative z-10 py-24 px-6 bg-gradient-to-br from-slate-50/50 to-blue-50/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Get in touch
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Have questions? We'd love to hear from you and help you get started.
          </p>

          <Card className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl border-white/50 hover:shadow-3xl transition-all duration-500">
            <CardContent className="p-10">
              <form className="space-y-8">
                <div>
                  <Input
                    placeholder="Your name"
                    className="py-4 px-6 rounded-2xl border-gray-200/50 focus-visible:ring-indigo-500 bg-gray-50/50 hover:bg-gray-50 transition-all duration-300"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your email"
                    className="py-4 px-6 rounded-2xl border-gray-200/50 focus-visible:ring-indigo-500 bg-gray-50/50 hover:bg-gray-50 transition-all duration-300"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Your message"
                    rows={5}
                    className="w-full py-4 px-6 rounded-2xl border border-gray-200/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gray-50/50 hover:bg-gray-50 transition-all duration-300"
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 text-lg font-semibold shadow-xl hover:shadow-2xl"
                >
                  Send Message ✨
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            TrelloAI
          </div>
          <p className="text-gray-500 mb-4">Transforming ideas into organized projects with AI</p>
          <p className="text-sm text-gray-400">&copy; 2024 TrelloAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
