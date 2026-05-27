const { useState, useRef } = React;

// SVG Icons
const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

window.AnimeSliderRow = function AnimeSliderRow({ title, subtitle, badgeText, animeList = [], onCardClick, toggleBookmark, myList }) {
    const sliderRef = useRef(null);
    const [showLeftBtn, setShowLeftBtn] = useState(false);
    const [showRightBtn, setShowRightBtn] = useState(true);

    const handleScroll = () => {
        const element = sliderRef.current;
        if (element) {
            setShowLeftBtn(element.scrollLeft > 10);
            setShowRightBtn(element.scrollLeft < (element.scrollWidth - element.clientWidth - 10));
        }
    };

    const scroll = (direction) => {
        const element = sliderRef.current;
        if (element) {
            const scrollAmount = direction === 'left' ? -element.clientWidth * 0.75 : element.clientWidth * 0.75;
            element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (animeList.length === 0) return null;

    return (
        <div className="relative group/row space-y-3">
            
            {/* Slider Header Titles */}
            <div className="flex items-center justify-between">
                <div className="text-left">
                    <div className="flex items-center space-x-2">
                        <h2 className="font-orbitron font-extrabold text-lg sm:text-2xl text-white uppercase tracking-wider relative group-hover/row:text-animePurple transition-colors duration-300">
                            {title}
                        </h2>
                        {badgeText && <span className="text-[9px] bg-animeYellow text-darkBg font-bold font-orbitron px-1.5 py-0.5 rounded tracking-wide animate-pulse">{badgeText}</span>}
                    </div>
                    <p className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">{subtitle}</p>
                </div>
            </div>

            {/* Sliders Area container */}
            <div className="relative overflow-visible">
                
                {/* Slide Navigation Left */}
                {showLeftBtn && (
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-1.5 md:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-darkBg/80 backdrop-blur-md border border-animePurple/25 text-white flex items-center justify-center cursor-pointer hover:bg-animePurple/40 transition-all duration-300 md:opacity-0 md:group-hover/row:opacity-100 shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                    >
                        <ChevronLeftIcon />
                    </button>
                )}

                {/* Core horizontal row */}
                <div 
                    ref={sliderRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar scroll-smooth snap-x"
                    style={{ scrollbarWidth: 'none' }}
                >
                    {animeList.map(anime => (
                        <div key={anime.id} className="snap-start flex-none">
                            <AnimeCard 
                                anime={anime} 
                                onCardClick={onCardClick} 
                                toggleBookmark={toggleBookmark}
                                myList={myList}
                            />
                        </div>
                    ))}
                </div>

                {/* Slide Navigation Right */}
                {showRightBtn && (
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-1.5 md:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 rounded-full bg-darkBg/80 backdrop-blur-md border border-animePurple/25 text-white flex items-center justify-center cursor-pointer hover:bg-animePurple/40 transition-all duration-300 md:opacity-0 md:group-hover/row:opacity-100 shadow-[0_0_10px_rgba(139,92,246,0.35)]"
                    >
                        <ChevronRightIcon />
                    </button>
                )}
            </div>
        </div>
    );
}
