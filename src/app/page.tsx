import Image from "next/image"
import Progress from "@/components/progress";
import Countdown from "@/components/countdown";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-zinc-50 font-sans min-h-screen">
      <main className="flex w-full flex-col items-center justify-between overflow-y-auto max-h-screen">      
        <div style={{
          backgroundImage: 'url(/baby.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }} 
        className="flex border-black w-full min-h-screen">   
        <p className="font-kaushan text-[80px] p-5 text-[#8A3D58]">Blunch P. Lobetania</p>
        
        </div>
        
        <Progress/>
        <Countdown />
       
      </main>
    </div>
  );
}
