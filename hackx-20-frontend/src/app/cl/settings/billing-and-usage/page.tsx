"use client";
import Image from "next/image";
import { UserIcon, Shield } from "lucide-react";
import LineChart from "@/components/billing-usage/billing";
import { usageCards } from "@/data/constant";
import { useUserStore } from "../../store/userInfoStore";
import UsageCard from "@/components/billing-usage/usage-cards";
import BreadCrumbs from "@/components/breadcrumbs";

const userData = {
  avatarUrl: "",
};

export default function BillingAndUsagePage() {
  const userInfo = useUserStore((state) => state.userInfo);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="flex flex-col">
        {/* Enhanced Top Bar */}
        <BreadCrumbs page={"Billing and Usage"} />

        {/* Main Content */}
        <div className="flex-1 p-2 sm:p-4 lg:p-6">
          <div className="bg-gradient-to-br from-[#A0D2DB] via-[#7FB8C3] to-[#329898] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8 max-h-[calc(100vh-120px)] overflow-y-auto scroll-container">
              {/* Upgrade Card for small and medium screens */}
              {userInfo.plan != "premium" && (
                <div className="bg-teal-500 backdrop-blur-sm rounded-xl p-4 border border-yellow-400/30 mb-4">
                  <div className="grid md:flex md:justify-between">
                    <div className="text">
                      <h4 className="font-bold text-white mb-2 text-lg">
                        Need More?
                      </h4>
                      <p className="text-white mb-3">
                        Upgrade your plan for higher limits.
                      </p>
                    </div>
                    <div className="btn flex md:items-center">
                      <button className="w-full bg-transparent  text-white font-semibold py-2 px-4 rounded-lg text-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Chart Section */}
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 items-start h-full">
                <div className="w-full overflow-x-auto lg:overflow-visible scroll-smooth">
                  <LineChart />
                </div>

                {/* Usage Cards with Responsive Grid */}
                <div className="w-full lg:min-w-[280px] lg:max-w-[320px] order-1 lg:order-2">
                  {/* Mobile/Small Tablet Grid (320px - 640px) */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:hidden gap-3 mb-4">
                    {usageCards.map((card, index) => (
                      <UsageCard key={card.title} card={card} />
                    ))}
                  </div>

                  {/* Medium Screens Grid (640px - 768px) */}
                  <div className="hidden md:grid lg:hidden grid-cols-3 gap-4 mb-4">
                    {usageCards.map((card, index) => (
                      <UsageCard key={card.title} card={card} />
                    ))}
                  </div>

                  {/* Large Screens Vertical Layout (768px - 1440px+) */}
                  <div className="hidden lg:flex flex-col gap-6">
                    {usageCards.map((card, index) => (
                      <UsageCard key={card.title} card={card} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
