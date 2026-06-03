import SubProgress from "./subprogress"

export default function Progress(){

    const progress = 10
    const radius = 120
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return(
        <div style={{ backgroundImage: "url(/darkpink.png)", backgroundSize: "cover", backgroundPosition: 'center', backgroundRepeat: "no-repeat"}} className="lg:border lg:justify-between w-full flex flex-col min-h-fit py-8 lg:min-h-screen items-center justify-center">
            <div>
                <p className="font-kaushan text-3xl md:text-5xl lg:text-[80px] p-2 md:p-4 lg:p-5 text-[#8A3D58] w-full flex items-center justify-center text-white">Progress Tracker</p>
            </div>
            <div className="flex flex-col w-full max-w-7xl px-4 gap-6 md:gap-8 lg:gap-10">
                <div className="w-full flex justify-center">
                    {/* Bottom - Pie Chart */}
                    <div className="flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-8 min-h-full py-4 lg:py-0">
                        
                        <div className="flex flex-col items-center">
                            <span className="font-kaushan text-3xl md:text-5xl lg:text-[80px] text-white text-center">Total Progress</span>
                        </div>

                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                            <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 384 384">
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
                                <span className="font-kaushan text-4xl md:text-5xl lg:text-7xl text-white">{progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 lg:gap-6 p-3 md:p-5 lg:p-6 items-center justify-items-center">
                    <SubProgress title='ABPSYCH'/>
                    <SubProgress title='DEV PSY'/>
                    <SubProgress title='PSY CAS'/>
                    <SubProgress title='I/O PSYCH'/>
                </div>
            </div>
            
        </div>
    )
}
