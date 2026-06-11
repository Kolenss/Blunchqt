import TodayCalendar from "@/components/today-calendar";

export default function CalendarPage() {
  return (
    <main
      className="flex min-h-screen w-full items-center justify-center bg-cover bg-center px-4 py-20"
      style={{ backgroundImage: "url(/lightpink.png)" }}
    >
      <TodayCalendar />
    </main>
  );
}
