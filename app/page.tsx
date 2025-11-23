'use client';

import { useState } from 'react';

const coffeeShops = [
  {
    id: 1,
    name: "Coffee Shop 1",
    location: "SoHo, NYC",
    image: "☕",
    amenities: ["Wi-Fi", "Reserved desk", "Coffee", "Matcha", "Food"],
  },
  {
    id: 2,
    name: "Coffee Shop 2",
    location: "Venice, LA",
    image: "🌊",
    amenities: ["Wi-Fi", "Reserved table", "Coffee", "Matcha", "Food", "Outdoor seating", "dog-friendly"],
  },
  {
    id: 3,
    name: "LA Mansion 1",
    location: "Los Angeles, CA",
    image: "🏠",
    amenities: ["Wi-Fi", "Reserved table", "Coffee", "Matcha", "Food", "Backyard", "dog-friendly"],
  },
  {
    id: 4,
    name: "SF Hacker House",
    location: "San Francisco, CA",
    image: "💻",
    amenities: ["Wi-Fi", "Reserved table", "Coffee", "Matcha", "Food", "dog-friendly"],
  },
];

export default function Home() {
  const [selectedShop, setSelectedShop] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Hero Section */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-amber-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-amber-900">☕ WFH Space</div>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
            Join Waitlist
          </button>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Work from places you work best<br />
            <span className="text-amber-600">Do you work better</span><br />
            at Coffee Shops / places that inspire you?
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tired of not being able to use your WFH stipend at coffee shops?
            <br />
            <span className="font-semibold text-gray-800">Well, now you can.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg">
              Reserve Your Spot
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-4 rounded-full font-semibold text-lg transition-colors border-2 border-gray-200">
              See How It Works
            </button>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-amber-100">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Use Your Stipend</h3>
              <p className="text-gray-600">Finally use your company's WFH stipend where you work best.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-amber-100">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Reserved Spot</h3>
              <p className="text-gray-600">Hate driving somewhere and no spots? See what&apos;s available before you go and reserve a dedicated spot like renting a desk.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow border border-amber-100">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Per session or monthly pricing</h3>
              <p className="text-gray-600">Work where you work best. That&apos;s worth paying for.</p>
            </div>
          </div>

          {/* Truth Bombs */}
          <div className="bg-amber-900 text-white rounded-3xl p-12 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Let's Be Real</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              <div className="flex gap-4">
                <span className="text-2xl">😴</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">Regular office spaces are boring</h4>
                  <p className="text-amber-100">Sterile offices, corporate vibes, and kombucha on tap that no one drinks.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">☕</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">Coffee shops have energy</h4>
                  <p className="text-amber-100">Real people, good music, natural light, and coffee that doesn't taste like sadness.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">💸</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">Your stipend is trapped</h4>
                  <p className="text-amber-100">Companies give you $200-500/mo for "workspace" but won't reimburse coffee shops.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-bold text-lg mb-2">You know where you work best</h4>
                  <p className="text-amber-100">Some thrive in the buzz of a cafe. That's the truth. That's productive.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coffee Shops Selection */}
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Partners
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              We've partnered with the best coffee shops in major cities. Pick your vibe.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coffeeShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => setSelectedShop(shop.id)}
                  className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 ${
                    selectedShop === shop.id ? 'border-amber-600 ring-4 ring-amber-100' : 'border-gray-100 hover:border-amber-200'
                  }`}
                >
                  <div className="text-5xl mb-4">{shop.image}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{shop.name}</h3>
                  <div className="space-y-2 text-left">
                    {shop.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-amber-600">✓</span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                  {selectedShop === shop.id && (
                    <button className="mt-4 w-full bg-amber-600 text-white py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors">
                      Reserve This Spot
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-12 mb-20 border border-amber-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-12">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">Pick Your Spot</h4>
                <p className="text-gray-600">Choose from our curated coffee shops in your city.</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">We Reserve It</h4>
                <p className="text-gray-600">We secure a dedicated desk or table just for you.</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">Use Your Stipend (Optional)</h4>
                <p className="text-gray-600">We provide you with the paperwork to submit to your company as a workspace expense.</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">Work Better</h4>
                <p className="text-gray-600">Show up, grab your coffee, and actually enjoy your workday.</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-amber-600 text-white rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Stop Forcing Where You Work
            </h2>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              You've known it all along—you work better at coffee shops. Now your company can pay for it.
            </p>
            <button className="bg-white text-amber-600 px-12 py-4 rounded-full font-bold text-xl hover:bg-amber-50 transition-colors shadow-lg">
              Get Started Today
            </button>
            <p className="text-sm text-amber-200 mt-4">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">☕ WFH Space</h4>
            <p className="text-gray-400 text-sm">Work from coffee shops. Use your stipend. Live your best life.</p>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Product</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Locations</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">For Companies</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Company</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-3">Legal</h5>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>2025 WFH Space.</p>
        </div>
      </footer>
    </div>
  );
}
