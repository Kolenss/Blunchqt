
interface SubProgressProps {
    title: string;
}

export default function SubProgress({ title }: SubProgressProps){
    return(
        <div style={{ backgroundImage: "url(/paperbg.png)", backgroundSize: "cover", backgroundPosition: 'center', backgroundRepeat: "no-repeat"}} className="flex flex-col w-[490px] h-[390px]">
            <div className="py-10">
                <p className="font-kaushan text-[30px] p-5 text-[#8A3D58] flex justify-center">{title}</p>
            </div>
            <div className="flex flex-col gap-4 px-9">
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">Total Topics:</span>
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">Completed:</span>
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">Remaining:</span>
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">Progress:</span>
                    <span className="font-kaushan text-[20px] text-[#8A3D58]">0%</span>
                </div>
            </div>
        </div> 
        )
    }