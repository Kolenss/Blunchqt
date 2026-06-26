import DashboardHero from "@/components/dashboard-hero";
import ShopModal from "@/components/shop-modal";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start font-sans min-h-screen overflow-x-hidden w-full">
      <main className="flex w-full flex-col items-center justify-start">
        {/* Unified dashboard: countdown, scrapbook hero, daily reflection,
            mastery overview (live progress data), rewards & curriculum. */}
        <DashboardHero />
      </main>

      {/* Shop + How-to-Earn modals — opened via window events from the hero. */}
      <ShopModal />
    </div>
  );
}
