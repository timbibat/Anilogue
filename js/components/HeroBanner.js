const { useState, useEffect } = React;

// SVG Icons
const PlayIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
);

const StarIcon = () => (
    <svg className="w-4 h-4 fill-animeYellow text-animeYellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

window.HeroBanner = function HeroBanner({ featuredList = [], onCardClick, toggleBookmark, myList }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (featuredList.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredList.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [featuredList]);

    if (featuredList.length === 0) {
        return (
            <div className="w-full h-[60vh] bg-darkBg flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const activeHero = featuredList[currentIndex];
    if (!activeHero) return null;

    const isBookmarked = myList.includes(activeHero.id);

    return (
        <section className="relative w-full h-[85vh] sm:h-[90vh] flex items-center overflow-hidden border-b border-animePurple/15 bg-darkBg">
            
            {/* Background Images with fading slides */}
            {featuredList.map((item, idx) => (
                <div 
                    key={item.id} 
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-40' : 'opacity-0'}`}
                >
                    <img 
                        src={item.banner || item.cover} 
                        alt={item.title} 
                        className="w-full h-full object-cover object-center scale-105"
                    />
                    {/* Color grading overlay grids */}
                    <div className="absolute inset-0 bg-gradient-to-r from-darkBg via-darkBg/60 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-transparent to-transparent"></div>
                </div>
            ))}

            {/* Hero Layout Content */}
            <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8 z-20 flex flex-col md:flex-row md:items-center justify-between gap-8 pt-16">
                
                {/* Left Content Description Column */}
                <div className="max-w-2xl text-left space-y-6 animate-slide-up">
                    
                    {/* Neon Same-Day release tags */}
                    {activeHero.sameDay && (
                        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-animePurple/20 to-transparent px-3.5 py-1.5 rounded-full border border-animePurple/40">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-animeYellow opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-animeYellow"></span>
                            </span>
                            <span className="text-[10px] sm:text-xs font-orbitron tracking-widest text-animeYellow font-bold uppercase">SAME DAY RELEASE</span>
                        </div>
                    )}

                    {/* Banner Anime Title */}
                    <h1 className="font-orbitron font-black text-4xl sm:text-6xl tracking-tight text-white leading-tight drop-shadow-lg neon-text-purple">
                        {activeHero.title}
                    </h1>

                    {/* Ratings, Year info row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-300">
                        <span className="flex items-center space-x-1.5 bg-yellow-500/10 text-animeYellow-neon border border-yellow-500/20 px-2.5 py-1 rounded-md">
                            <StarIcon />
                            <span>{activeHero.rating} Score</span>
                        </span>
                        <span>{activeHero.year}</span>
                        <span className="text-animePurple-light font-orbitron tracking-wide">{activeHero.type}</span>
                        <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded text-[10px] text-gray-400 font-bold uppercase tracking-wider">{activeHero.episodes} Episodes</span>
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed max-w-xl line-clamp-3">
                        {activeHero.synopsis}
                    </p>

                    {/* Interaction Buttons Row */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button 
                            onClick={() => onCardClick(activeHero)}
                            className="bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron text-xs font-bold tracking-widest px-6 sm:px-8 py-3 rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-95 transition-all duration-300 shadow-neon-purple shadow-animePurple/20 flex items-center space-x-2 cursor-pointer"
                        >
                            <PlayIcon className="w-4.5 h-4.5" />
                            <span>WATCH NOW</span>
                        </button>
                        
                        <button 
                            onClick={() => toggleBookmark(activeHero.id)}
                            className={`font-orbitron text-xs font-bold tracking-widest px-6 py-3 rounded-md border active:scale-95 transition-all duration-300 flex items-center space-x-2 cursor-pointer ${isBookmarked ? 'bg-animeYellow/10 border-animeYellow text-animeYellow' : 'border-white/20 text-white hover:border-animePurple hover:bg-animePurple/10'}`}
                        >
                            {isBookmarked ? <CheckIcon /> : <PlusIcon />}
                            <span>{isBookmarked ? 'WATCHLISTED' : 'ADD TO MY LIST'}</span>
                        </button>
                        
                        <button 
                            onClick={() => onCardClick(activeHero)}
                            className="w-11 h-11 rounded-md border border-white/10 bg-white/5 hover:border-animePurple hover:bg-animePurple/15 text-white active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
                            title="More Info"
                        >
                            <InfoIcon />
                        </button>
                    </div>

                </div>

                {/* Right Side Dots Navigation Selector */}
                <div className="flex md:flex-col items-center justify-center gap-3 self-center md:self-end md:pb-12 z-20">
                    <div className="text-[10px] font-orbitron font-extrabold text-gray-500 tracking-wider hidden md:block rotate-270 mb-8 uppercase">Showcases</div>
                    <div className="flex md:flex-col gap-2">
                        {featuredList.map((item, idx) => (
                            <button 
                                key={item.id} 
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-2 rounded-full slide-indicator transition-all ${idx === currentIndex ? 'w-8 md:w-2 md:h-8 bg-animePurple' : 'w-2 bg-gray-600'}`}
                            ></button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Gradient Transition Overlays at absolute bottom */}
            <div className="absolute bottom-0 left-0 w-full h-24 hero-gradient z-10"></div>
        </section>
    );
}
