import InteractiveGlobe from "@/components/interactive-globe";

export default function Map() {
    return (
        <div className="bg-[#03035F] rounded-lg">
            {/* Header */}
            <div className="text-center pt-4 text-white">
                <h2 className="text-2xl font-bold">Interactive Building Map Directory</h2>
                <p className="text-md">Click on markers to learn more about each building</p>
            </div>

            {/* The Globe */}
            <div className="h-[calc(100vh-12rem)] w-full overflow-hidden">
                <InteractiveGlobe />
            </div>
        </div>
    );
}