import Progress from "@/components/progress";
import Countdown from "@/components/countdown";
import TodayCalendar from "@/components/today-calendar";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center lg:justify-start bg-zinc-50 font-sans min-h-screen overflow-x-hidden w-full">
      <main className="flex w-full flex-col items-center justify-between lg:justify-start overflow-y-auto lg:overflow-visible max-h-screen lg:max-h-full">
        <div
          className="flex flex-col lg:border-black w-full min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/testbg.png')] items-start lg:items-center justify-start lg:justify-start pt-8 lg:pt-0"
        >
          <p className="animate-fade-in-up font-kaushan text-4xl md:text-8xl lg:text-[80px] p-2 md:p-4 lg:p-5 text-[#8A3D58] lg:text-start text-center w-full">Blunch P. Lobetania</p>
        </div>

        <Progress/>
        <Countdown />
        <TodayCalendar compact />

      </main>
    </div>
  );
}
