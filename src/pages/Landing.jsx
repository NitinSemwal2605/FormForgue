import React from 'react';
import { ArrowRight, BarChart3, Shield, Star, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import Button from "../components/ui/Button";

const features = [
  {
    icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", description: "Build forms in minutes, not hours. Our intuitive drag-and-drop interface makes form creation effortless."
  },
  {
    icon: <Shield className="w-6 h-6" />, title: "Enterprise Security", description: "Bank-level security with end-to-end encryption. Your data is protected with industry-leading standards."
  },
  {
    icon: <BarChart3 className="w-6 h-6" />, title: "Advanced Analytics", description: "Get deep insights into form performance with real-time analytics and detailed reporting."
  },
  {
    icon: <Users className="w-6 h-6" />, title: "Team Collaboration", description: "Work together seamlessly with real-time collaboration and role-based permissions."
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "FormForge has revolutionized how we collect customer feedback. The analytics are incredible!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Marketing Director",
    company: "GrowthLab",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "The drag-and-drop interface is so intuitive. We've reduced form creation time by 80%.",
    rating: 5
  },
  {
    name: "Emily Rodriguez",
    role: "UX Designer",
    company: "DesignStudio",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "Beautiful forms that match our brand perfectly. The customization options are endless.",
    rating: 5
  }
];

const stats = [
  { label: "Users", value: "10,000+" },
  { label: "Forms Created", value: "1M+" },
  { label: "Uptime", value: "99.99%" },
  { label: "Support", value: "24/7" },
];

const HeroGrid = () => (
  <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
    <svg width="100%" height="100%" className="w-full h-full" style={{ minHeight: 500 }}>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="40" height="40" fill="#000" />
          <rect x="0" y="0" width="40" height="40" fill="none" stroke="#222" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

const botQuestions = [
  { q: 'About', a: 'FormForge is a modern form builder for teams and businesses. Create, share, and analyze forms with ease.' },
  { q: 'Pricing', a: 'We offer Free, Pro ($19/mo), and Business ($49/mo) plans. See the Pricing section above for details.' },
  { q: 'How to get started?', a: 'Click "Start Building Free" on the hero section or sign up from the top right. No credit card required!' },
  { q: 'Contact info', a: 'You can reach us at support@formforge.com or see the Contact section below.' },
];

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  return (
    <>
      {/* Floating Bot Button */}
      <button
        className="fixed z-50 bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl w-16 h-16 flex items-center justify-center text-3xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        onClick={() => setOpen(true)}
        aria-label="Open chat bot"
        style={{ boxShadow: '0 4px 24px 0 #6366f1aa' }}
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="white"/><path d="M8 10h8M8 14h5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/><circle cx="17" cy="17" r="1.5" fill="#6366f1"/></svg>
      </button>
      {/* Chat Window */}
      {open && (
        <div className="fixed z-50 bottom-24 right-6 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
            <span className="text-white font-bold text-lg">FormForge Bot</span>
            <button className="text-white text-xl hover:scale-125 transition-transform" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="flex-1 px-4 py-3 bg-white min-h-[120px]">
            {!selected ? (
              <div className="flex flex-col gap-3">
                <div className="text-gray-700 font-medium mb-2">How can I help you?</div>
                {botQuestions.map((item, i) => (
                  <button
                    key={item.q}
                    className="w-full text-left px-4 py-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-blue-700 font-semibold transition-all"
                    onClick={() => setSelected(i)}
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="text-blue-700 font-semibold">{botQuestions[selected].q}</div>
                <div className="text-gray-800 bg-blue-50 rounded-lg p-3">{botQuestions[selected].a}</div>
                <button className="text-xs text-blue-500 underline self-end mt-2" onClick={() => setSelected(null)}>Ask another question</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                FormForge
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors">Testimonials</a>
              <Button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                Get Started
              </Button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black border-t border-gray-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">Features</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">Testimonials</a>
              <Button
                onClick={handleGetStarted}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - No Grid, Fullscreen Centered */}
      <section className="relative flex flex-col items-center justify-center min-h-screen w-full text-center z-10 overflow-hidden bg-black">
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-36 right-20 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-16 right-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-300 border border-blue-500/30 mb-5 animate-bounce-slow shadow-lg backdrop-blur-sm">
            <Star className="w-3 h-3 mr-2 text-yellow-400" />
            Trusted by 10,000+ companies worldwide
          </div>
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
              Build Forms
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl animate-gradient">
              That Convert
            </span>
          </h1>
          {/* Subheadline */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed font-light">
            Create stunning, high-converting forms in minutes. <span className="text-white font-medium">No coding required.</span> Drag, drop, and watch your business grow.
          </p>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={handleGetStarted}
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl border-2 border-transparent hover:border-blue-400 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Button>
            <button
              className="group flex items-center px-6 py-3 rounded-xl font-bold text-lg border-2 border-gray-700 text-white bg-black/40 hover:bg-gray-900/60 hover:border-gray-600 transition-all duration-300 shadow-lg backdrop-blur-sm"
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
            >
              <div className="relative w-7 h-7 mr-3 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-3.5 h-3.5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
                  Watch Demo
                </button>
          </div>
          {/* Trust Indicators */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-gray-400 text-xs font-medium">No credit card required • 14-day free trial</p>
            <div className="flex items-center space-x-4 text-gray-500 text-xs">
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Free forever plan
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                GDPR compliant
              </div>
            </div>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-5 h-8 border-2 border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gray-400 rounded-full mt-1 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Integration Marquee/Strip with Logos and Names - Super Cool Version */}
      <section className="w-full py-10 bg-black relative">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
          Seamless integration with your favorite tools
        </h2>
        <div className="relative overflow-hidden w-full">
          {/* Gradient fade left/right */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-16 z-10" style={{background: 'linear-gradient(to right, #000 80%, transparent)'}}></div>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-16 z-10" style={{background: 'linear-gradient(to left, #000 80%, transparent)'}}></div>
          <div className="marquee flex items-center gap-20 h-32 will-change-transform">
            {/* Repeat the logo+name set 3 times for infinite effect */}
            {[...Array(3)].map((_, repeatIdx) => (
              <React.Fragment key={`repeat-${repeatIdx}`}>
                {/* WordPress */}
                <div key={`wp-${repeatIdx}`} className="flex flex-col items-center w-24 group cursor-pointer">
                  <span className="inline-block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#23282d"/><path d="M24 8C15.163 8 8 15.163 8 24c0 8.837 7.163 16 16 16s16-7.163 16-16c0-8.837-7.163-16-16-16zm0 2c7.732 0 14 6.268 14 14 0 5.13-2.89 9.6-7.13 11.93l-4.13-11.32c.01-.03.02-.06.02-.09 0-.16-.06-.31-.16-.43l-.01-.01c-.09-.11-.23-.18-.38-.18-.14 0-.28.07-.37.18l-.01.01c-.1.12-.16.27-.16.43 0 .03.01.06.02.09l-4.13 11.32C10.89 31.6 8 27.13 8 22c0-7.732 6.268-14 14-14zm0 28c-2.21 0-4.29-.45-6.18-1.25l4.18-11.45 2 5.5 2-5.5 4.18 11.45C28.29 35.55 26.21 36 24 36z" fill="#fff"/></svg></span>
                  <span className="text-xs text-gray-300 font-medium mt-1">WordPress</span>
                </div>
                {/* Shopify */}
                <div key={`shopify-${repeatIdx}`} className="flex flex-col items-center w-24 group cursor-pointer">
                  <span className="inline-block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="24" fill="#96bf48"/><path d="M24 12l-7 2.5 2 17.5 5 2 5-2 2-17.5-7-2.5zm0 2.2l5.2 1.8-1.7 15.2-3.5 1.4-3.5-1.4-1.7-15.2L24 14.2z" fill="#fff"/></svg></span>
                  <span className="text-xs text-gray-300 font-medium mt-1">Shopify</span>
                </div>
                {/* Webflow */}
                <div key={`webflow-${repeatIdx}`} className="flex flex-col items-center w-24 group cursor-pointer">
                  <span className="inline-block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#4353ff"/><path d="M16 32l4-16 4 10 4-10 4 16h-2l-2-8-4 8-4-8-2 8h-2z" fill="#fff"/></svg></span>
                  <span className="text-xs text-gray-300 font-medium mt-1">Webflow</span>
                </div>
                {/* Wix */}
                <div key={`wix-${repeatIdx}`} className="flex flex-col items-center w-24 group cursor-pointer">
                  <span className="inline-block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="24" fill="#fff"/><path d="M12 32l4-16 4 10 4-10 4 16h-2l-2-8-4 8-4-8-2 8h-2z" fill="#000"/></svg></span>
                  <span className="text-xs text-gray-300 font-medium mt-1">Wix</span>
                </div>
                {/* Notion */}
                <div key={`notion-${repeatIdx}`} className="flex flex-col items-center w-24 group cursor-pointer">
                  <span className="inline-block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#fff"/><path d="M16 16h16v16H16V16zm2 2v12h12V18H18z" fill="#000"/></svg></span>
                  <span className="text-xs text-gray-300 font-medium mt-1">Notion</span>
                </div>
                {/* Zapier */}
                <div key={`zapier-${repeatIdx}`} className="flex flex-col items-center w-24 group cursor-pointer">
                  <span className="inline-block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="24" fill="#ff4f00"/><path d="M24 14v20M14 24h20M18.93 18.93l10.14 10.14M29.07 18.93L18.93 29.07" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg></span>
                  <span className="text-xs text-gray-300 font-medium mt-1">Zapier</span>
                </div>
                {/* Slack */}
                <div key={`slack-${repeatIdx}`} className="flex flex-col items-center w-24 group cursor-pointer">
                  <span className="inline-block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-glow"><svg width="56" height="56" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="24" fill="#fff"/><rect x="13" y="21" width="6" height="6" rx="3" fill="#36C5F0"/><rect x="21" y="13" width="6" height="6" rx="3" fill="#2EB67D"/><rect x="29" y="21" width="6" height="6" rx="3" fill="#ECB22E"/><rect x="21" y="29" width="6" height="6" rx="3" fill="#E01E5A"/></svg></span>
                  <span className="text-xs text-gray-300 font-medium mt-1">Slack</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        <style>{`
          .drop-shadow-glow {
            filter: drop-shadow(0 0 8px #6366f1) drop-shadow(0 0 16px #a21caf);
          }
        `}</style>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-20 bg-black relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">Pricing</h2>
        <p className="text-center text-gray-400 mb-12 text-lg max-w-2xl mx-auto">Simple, transparent pricing for every team. Start for free, upgrade as you grow.</p>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="flex flex-col bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8 items-center">
            <h3 className="text-xl font-bold text-white mb-2">Free</h3>
            <div className="text-4xl font-extrabold text-white mb-2">$0<span className="text-lg font-medium text-gray-400">/mo</span></div>
            <div className="text-gray-400 mb-6">For individuals and hobby projects</div>
            <ul className="text-gray-300 text-sm space-y-2 mb-8 w-full">
              <li>✔️ Unlimited forms</li>
              <li>✔️ 100 responses/month</li>
              <li>✔️ Basic analytics</li>
              <li>✔️ Email support</li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg">Get Started</Button>
          </div>
          {/* Pro Plan (highlighted) */}
          <div className="flex flex-col bg-gradient-to-br from-blue-700/80 via-purple-700/80 to-pink-700/80 rounded-3xl shadow-2xl border-2 border-blue-500 p-8 items-center scale-105 z-10">
            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
            <div className="text-4xl font-extrabold text-white mb-2">$19<span className="text-lg font-medium text-gray-200">/mo</span></div>
            <div className="text-gray-200 mb-6">For professionals and small teams</div>
            <ul className="text-gray-100 text-sm space-y-2 mb-8 w-full">
              <li>✔️ Everything in Free</li>
              <li>✔️ 10,000 responses/month</li>
              <li>✔️ Advanced analytics</li>
              <li>✔️ Integrations & API</li>
              <li>✔️ Priority support</li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg">Start Pro</Button>
          </div>
          {/* Business Plan */}
          <div className="flex flex-col bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-800 p-8 items-center">
            <h3 className="text-xl font-bold text-white mb-2">Business</h3>
            <div className="text-4xl font-extrabold text-white mb-2">$49<span className="text-lg font-medium text-gray-400">/mo</span></div>
            <div className="text-gray-400 mb-6">For growing businesses & enterprises</div>
            <ul className="text-gray-300 text-sm space-y-2 mb-8 w-full">
              <li>✔️ Everything in Pro</li>
              <li>✔️ Unlimited responses</li>
              <li>✔️ Custom branding</li>
              <li>✔️ SSO & advanced security</li>
              <li>✔️ Dedicated support</li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg">Contact Sales</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you create, manage, and optimize your forms for maximum conversion.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-black border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 shadow-xl animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (Swiper Carousel) */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by Teams
              <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"> Worldwide</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              See what our customers have to say about their experience with FormForge.
            </p>
          </div>
          <Swiper
            spaceBetween={32}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            effect="fade"
            speed={900}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 2 },
            }}
            className="pb-8"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div
                  className="p-10 rounded-3xl bg-gradient-to-br from-gray-900/80 to-black border border-blue-900/40 shadow-2xl flex flex-col items-center text-center mx-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-20 h-20 rounded-full mb-4 border-4 border-blue-500 shadow-lg" />
                  <div className="flex mb-2 justify-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-200 mb-6 leading-relaxed text-lg font-medium">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-white text-lg">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center md:items-start animate-fade-in-up">
          {/* Info Left */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-8 bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-gray-800 w-full max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Contact Information</h2>
            <div className="flex flex-col gap-6 w-full">
              <div className="flex items-start gap-4">
                <span className="text-blue-400"><svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></span>
                <div>
                  <div className="text-white font-medium">support@formforge.com</div>
                  <div className="text-white font-medium">info@formforge.com</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-green-400"><svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3.5A1.5 1.5 0 013.5 2h1A1.5 1.5 0 016 3.5V4a1 1 0 01-1 1H3.5A1.5 1.5 0 012 3.5v0zM2 16.5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5V16a1 1 0 00-1-1H3.5A1.5 1.5 0 002 16.5v0zM16 3.5A1.5 1.5 0 0117.5 2h1A1.5 1.5 0 0120 3.5V4a1 1 0 01-1 1h-1.5A1.5 1.5 0 0116 3.5v0zM16 16.5A1.5 1.5 0 0017.5 18h1A1.5 1.5 0 0020 16.5V16a1 1 0 00-1-1h-1.5A1.5 1.5 0 0016 16.5v0z"/><path d="M7 7h6v6H7V7z"/></svg></span>
                <div>
                  <div className="text-white font-medium">+91 98765 43210</div>
                  <div className="text-white font-medium">+91 98765 43211</div>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-pink-400"><svg width="28" height="28" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1110 6a2.5 2.5 0 010 5.5z"/></svg></span>
                <div>
                  <div className="text-white font-medium">Chandigarh University</div>
                  <div className="text-gray-300 text-sm">NH-05, Ludhiana - Chandigarh State Hwy, Punjab 140413</div>
                </div>
              </div>
            </div>
            {/* Google Map for Chandigarh University */}
            <div className="w-full mt-4">
              <iframe
                title="Chandigarh University Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.181047013712!2d76.5761713151327!3d30.77187298162606!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ffb8d2e2e2e2b%3A0x7e2e2e2e2e2e2e2e!2sChandigarh%20University!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
                width="100%"
                height="180"
                style={{ border: 0, borderRadius: '1rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
        </div>
          {/* Form Right */}
          <form className="flex-1 flex flex-col gap-4 bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-gray-800 max-w-lg w-full">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">Contact Us</h2>
            <p className="text-gray-400 mb-2 text-base">Have questions or want to get in touch? Fill out the form below or email <a href="mailto:support@formforge.com" className="text-blue-400 underline">support@formforge.com</a>.</p>
            <div className="relative">
              <input type="text" placeholder="Your Name" className="w-full px-4 py-3 pl-12 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" required />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/></svg></span>
            </div>
            <div className="relative">
              <input type="email" placeholder="Your Email" className="w-full px-4 py-3 pl-12 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" required />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg></span>
            </div>
            <div className="relative">
              <textarea placeholder="Your Message" className="w-full px-4 py-3 pl-12 rounded-lg bg-black/80 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" rows={4} required />
              <span className="absolute left-4 top-4 text-blue-400"><svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12v2H4V4zm0 4h12v2H4V8zm0 4h8v2H4v-2z"/></svg></span>
            </div>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg mt-2 shadow-lg">Send Message</Button>
          </form>
        </div>
      </section>

      {/* Footer - Engaging and Detailed */}
      <footer className="w-full bg-black text-gray-300 pt-16 pb-8 px-4 sm:px-8 border-t border-gray-900 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Tagline */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">FormForge</h3>
            <p className="text-gray-400 mb-4">Build beautiful, high-converting forms for any use case. Fast, secure, and easy to integrate anywhere.</p>
            <form className="flex items-center gap-2 mt-4">
              <input type="email" placeholder="Subscribe to newsletter" className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" />
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 transition-all">Subscribe</button>
            </form>
          </div>
          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
            </ul>
          </div>
          {/* Socials */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="hover:text-blue-400 transition-colors"><svg width="28" height="28" fill="currentColor"><circle cx="14" cy="14" r="12" /></svg></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><svg width="28" height="28" fill="currentColor"><circle cx="14" cy="14" r="12" /></svg></a>
              <a href="#" className="hover:text-blue-400 transition-colors"><svg width="28" height="28" fill="currentColor"><circle cx="14" cy="14" r="12" /></svg></a>
              <a href="#" className="hover:text-pink-400 transition-colors"><svg width="28" height="28" fill="currentColor"><circle cx="14" cy="14" r="12" /></svg></a>
            </div>
            <div className="text-gray-400 text-sm flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg> support@formforge.com</div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          © 2024 FormForge. All rights reserved. | Made with <span className="text-pink-500">♥</span> by the FormForge Team
        </div>
      </footer>
      {/* Custom Animations */}
      <style>{`
        .animate-bounce-slow {
          animation: bounce 2.5s infinite;
        }
        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(40px);
          animation: fadeInUp 0.8s forwards;
        }
        .animate-fade-in-scale {
          opacity: 0;
          transform: scale(0.95);
          animation: fadeInScale 1s forwards;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }
        .marquee {
          animation: marquee 18s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes fadeInScale {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
      <ChatBot />
    </div>
  );
};

export default Landing; 