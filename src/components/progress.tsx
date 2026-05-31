import SubProgress from "./subprogress"

export default function Progress(){

    const progress = 10
    const radius = 120
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return(
        <div style={{ backgroundImage: "url(/darkpink.png)", backgroundSize: "cover", backgroundPosition: 'center', backgroundRepeat: "no-repeat"}} className="w-full flex flex-col min-h-screen items-center justify-center">
            <div>
                <p className="font-kaushan text-[50px] p-5 text-[#8A3D58] text-[80px] w-full flex items-center justify-center text-white">Progress Traker</p>
            </div>
            <div className="flex flex-row">
                <div>
                    {/* Bottom - Pie Chart */}
                    <div className=" flex flex-col items-center justify-center gap-8 min-h-full">
                        
                        <div className="flex flex-col items-start">
                            <span className="font-kaushan text-[80px] text-white text-center">Total Progress</span>
                        </div>

                        <div className="relative w-96 h-96">
                            <svg className="transform -rotate-90 w-full h-full">
                                <circle
                                    cx="192"
                                    cy="192"
                                    r="120"
                                    stroke="#852e50"
                                    strokeWidth="60"
                                    fill="none"
                                />
                                <circle
                                    cx="192"
                                    cy="192"
                                    r="120"
                                    stroke="#d0df9e"
                                    strokeWidth="60"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="font-kaushan text-7xl text-white">{progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6 p-6">
                    <SubProgress title='ABPSYCH'/>
                    <SubProgress title='DEV PSY'/>
                    <SubProgress title='PSY CAS'/>
                    <SubProgress title='I/O PSYCH'/>
            </div>
            </div>
            
        </div>
    )
}