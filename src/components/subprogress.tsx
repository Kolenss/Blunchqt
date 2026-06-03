
interface SubProgressProps {
    title: string;
}

export default function SubProgress({ title }: SubProgressProps){
    return(
        <div style={{ backgroundImage: "url(/paperbg.png)", backgroundSize: "cover", backgroundPosition: 'center', backgroundRepeat: "no-repeat"}} className="flex flex-col w-full max-w-[490px] pt-5 h-[300px] md:h-[380px] lg:h-[390px]">
            <div className="py-6 md:py-8 lg:py-10">
                <p className="font-kaushan text-xl md:text-3xl lg:text-[30px] p-2 md:p-4 lg:p-5 text-[#8A3D58] flex justify-center">{title}</p>
            </div>
            <div className="flex flex-col gap-2 md:gap-4 lg:gap-4 px-4 md:px-8 lg:px-9">
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">Total Topics:</span>
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">Completed:</span>
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">Remaining:</span>
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">Progress:</span>
                    <span className="font-kaushan text-sm md:text-xl lg:text-[20px] text-[#8A3D58]">0%</span>
                </div>
            </div>
        </div> 
        )
    }
