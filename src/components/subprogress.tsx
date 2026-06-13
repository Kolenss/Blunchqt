interface SubProgressProps {
    title: string;
    total: number;
    completed: number;
    remaining: number;
    progress: number;
    index?: number;
}

export default function SubProgress({ title, total, completed, remaining, progress, index = 0 }: SubProgressProps){
    const staggerClass = `stagger-${Math.min(index + 2, 6)}`;
    return(
        <div style={{ backgroundImage: "url(/paperbg.png)", backgroundSize: "cover", backgroundPosition: 'center', backgroundRepeat: "no-repeat"}} className={`animate-fade-in-up ${staggerClass} flex flex-col w-full max-w-[490px] pt-5 h-[300px] md:h-[380px] lg:h-[390px] hover:scale-[1.03] transition-transform duration-300`}>
            <div className="py-6 md:py-8 lg:py-10">
                <p className="font-kaushan text-xl md:text-3xl lg:text-[30px] p-2 md:p-4 lg:p-5 text-[#8A3D58] flex justify-center">{title}</p>
            </div>
            <div className="flex flex-col gap-2 md:gap-4 lg:gap-4 px-4 md:px-8 lg:px-9">
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm md:text-lg lg:text-xl text-[#8A3D58]">Total Topics:</span>
                    <span className="text-sm md:text-lg lg:text-xl text-[#8A3D58]">{total}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm md:text-lg lg:text-xl text-[#8A3D58]">Completed:</span>
                    <span className="text-sm md:text-lg lg:text-xl text-[#8A3D58]">{completed}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm md:text-lg lg:text-xl text-[#8A3D58]">Remaining:</span>
                    <span className="text-sm md:text-lg lg:text-xl text-[#8A3D58]">{remaining}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm md:text-lg lg:text-xl text-[#8A3D58]">Progress:</span>
                    <span className="text-sm md:text-lg lg:text-xl text-[#8A3D58]">{progress.toFixed(1)}%</span>
                </div>
            </div>
        </div>
        )
    }
