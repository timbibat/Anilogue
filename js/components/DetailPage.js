const { useState, useEffect } = React;
const apiService = window.apiService;

// SVG Icons
const StarIcon = () => (
    <svg className="w-3.5 h-3.5 fill-animeYellow text-animeYellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

window.DetailPage = function DetailPage({ anime, onClose, toggleBookmark, myList }) {
    const [activeTab, setActiveTab] = useState("specifications"); // 'specifications' | 'synopsis'
    const [detailedAnime, setDetailedAnime] = useState(null);
    const [loading, setLoading] = useState(true);

    const isBookmarked = myList.includes(anime.id);

    // Fetch full anime details on mount
    useEffect(() => {
        let isMounted = true;
        async function fetchDetails() {
            setLoading(true);
            try {
                const data = await apiService.getAnimeDetails(anime.id);
                if (isMounted) {
                    if (data && !data.isUnconfigured) {
                        setDetailedAnime(data);
                    } else {
                        setDetailedAnime(anime);
                    }
                }
            } catch (err) {
                console.error("Error loading anime details:", err);
                if (isMounted) {
                    setDetailedAnime(anime);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        
        fetchDetails();
        return () => { isMounted = false; };
    }, [anime]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [anime]);

    const currentAnime = detailedAnime || anime;

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-16 min-h-[70vh] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen text-left animate-fade-in pt-20">
            {/* Cinematic Hero Backdrop Banner */}
            <div className="relative w-full h-[350px] sm:h-[450px] overflow-hidden flex flex-col justify-end">
                <img 
                    src={currentAnime.banner || currentAnime.cover} 
                    alt={currentAnime.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[2px]"
                />
                {/* Modern Vignette Layering Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-darkBg via-darkBg/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-darkBg via-transparent to-darkBg/10"></div>
                
                {/* Back Button and Quick Header Content */}
                <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 md:px-8 pb-10 flex flex-col space-y-6">
                    <button 
                        onClick={onClose}
                        className="self-start px-4 py-2 rounded-full bg-darkCard/80 backdrop-blur-md border border-animePurple/20 text-white hover:border-animePurple flex items-center space-x-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/30 text-xs font-orbitron tracking-wider"
                    >
                        <ArrowLeftIcon />
                        <span>BACK TO BROWSE</span>
                    </button>

                    <div className="space-y-3">
                        <span className="bg-animePurple/20 text-animePurple-light text-[11px] font-extrabold px-3 py-1 rounded font-orbitron tracking-wider border border-animePurple/30 uppercase">
                            {currentAnime.type}
                        </span>
                        <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-white leading-tight drop-shadow-md tracking-wide max-w-4xl">
                            {currentAnime.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-300 font-semibold pt-1">
                            <span className="flex items-center text-animeYellow space-x-1.5 drop-shadow-[0_0_8px_rgba(245,158,11,0.45)]">
                                <svg className="w-4 h-4 fill-animeYellow text-animeYellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                <span className="font-orbitron font-extrabold text-base">{currentAnime.rating}</span>
                                <span className="text-[10px] font-bold text-animeYellow/85 font-orbitron uppercase tracking-wider pl-0.5">Average Score</span>
                            </span>
                            <span className="text-gray-600">|</span>
                            <span>{currentAnime.year}</span>
                            <span className="text-gray-600">|</span>
                            <span>{currentAnime.episodes} Episodes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Specifications Grid */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-20 relative z-10 -mt-6">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    
                    {/* Left Column - Poster Showcase & Action Panel */}
                    <div className="w-full lg:w-1/4 space-y-6 flex flex-col items-center lg:items-stretch">
                        
                        {/* High-Resolution Poster Card */}
                        <div className="relative w-64 lg:w-full aspect-[2/3] rounded-2xl overflow-hidden neon-border-purple border-2 shadow-2xl shadow-black/80 hover:scale-[1.02] transition-transform duration-300">
                            <img 
                                src={currentAnime.cover} 
                                alt={currentAnime.title} 
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Premium Glowing Score Showcase Card */}
                        <div className="w-64 lg:w-full bg-darkBg/95 border border-animePurple/20 rounded-xl p-4 flex items-center justify-between shadow-lg shadow-animePurple/5 select-none">
                            <div className="space-y-0.5">
                                <span className="text-[9px] text-animePurple-light font-orbitron uppercase tracking-widest font-black block">AVERAGE SCORE</span>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-3xl font-black font-orbitron text-animeYellow drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">{currentAnime.rating}</span>
                                    <span className="text-[10px] text-gray-500 font-bold">/ 10</span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-full bg-animeYellow/10 border border-animeYellow/30 flex items-center justify-center text-animeYellow shadow-inner shadow-animeYellow/10 animate-pulse">
                                <svg className="w-5 h-5 fill-animeYellow text-animeYellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </div>
                        </div>

                        {/* Direct Interactions Panel */}
                        <div className="w-64 lg:w-full space-y-3">
                            <button 
                                onClick={() => toggleBookmark(currentAnime.id)}
                                className={`w-full py-3.5 rounded font-orbitron font-bold text-xs tracking-wider border flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer ${isBookmarked ? 'bg-animeYellow/10 border-animeYellow text-animeYellow' : 'bg-animePurple border-animePurple hover:bg-animePurple/85 text-white hover:border-animePurple shadow-lg shadow-animePurple/20'}`}
                            >
                                {isBookmarked ? (
                                    <>
                                        <CheckIcon />
                                        <span>IN WATCHLIST</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon />
                                        <span>ADD TO MY WATCHLIST</span>
                                    </>
                                )}
                            </button>

                            <a 
                                href={`https://myanimelist.net/anime/${currentAnime.id}`} 
                                target="_blank" 
                                rel="noopener"
                                className="w-full py-3.5 rounded bg-darkCard/80 backdrop-blur-md border border-animePurple/20 hover:border-animePurple text-white font-orbitron font-bold text-xs tracking-wider flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] cursor-pointer text-center"
                            >
                                <span>VIEW ON MYANIMELIST</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
                        </div>
                    </div>

                    {/* Right Column - Deep Profile Specifications Tabs */}
                    <div className="w-full lg:w-3/4 space-y-6">
                        
                        {/* Custom Large Tabs Layout switcher */}
                        <div className="flex border-b border-animePurple/20 text-sm font-semibold tracking-wider font-orbitron">
                            <button 
                                onClick={() => setActiveTab("specifications")}
                                className={`py-4.5 px-6 focus:outline-none cursor-pointer uppercase transition-colors relative ${activeTab === 'specifications' ? 'text-white border-b-2 border-animePurple' : 'text-gray-400 hover:text-white'}`}
                            >
                                SPECIFICATIONS
                            </button>
                            <button 
                                onClick={() => setActiveTab("synopsis")}
                                className={`py-4.5 px-6 focus:outline-none cursor-pointer uppercase transition-colors relative ${activeTab === 'synopsis' ? 'text-white border-b-2 border-animePurple' : 'text-gray-400 hover:text-white'}`}
                            >
                                SYNOPSIS & BIO
                            </button>
                        </div>

                        {/* Specifications Content panel */}
                        <div className="bg-darkCard/50 border border-animePurple/15 rounded-2xl p-6 sm:p-8 shadow-xl min-h-[300px]">
                            
                            {activeTab === "synopsis" && (
                                <div className="space-y-6 animate-fade-in text-gray-300">
                                    <div className="space-y-3">
                                        <h3 className="text-sm text-animePurple-light font-bold font-orbitron uppercase tracking-widest">MAL Synopsis</h3>
                                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-medium">
                                            {currentAnime.synopsis}
                                        </p>
                                    </div>

                                    {currentAnime.background && (
                                        <div className="space-y-3 border-t border-animePurple/10 pt-4">
                                            <h3 className="text-sm text-animeYellow font-bold font-orbitron uppercase tracking-widest">Production Background Notes</h3>
                                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed italic">
                                                {currentAnime.background}
                                            </p>
                                        </div>
                                    )}

                                    {currentAnime.studios && currentAnime.studios.length > 0 && (
                                        <div className="text-sm text-gray-400 font-semibold border-t border-animePurple/10 pt-4 flex items-center space-x-2">
                                            <span>Production Studio:</span>
                                            <span className="text-animePurple-light font-bold uppercase tracking-wide">{currentAnime.studios.join(", ")}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 pt-4">
                                        {currentAnime.genres.map(g => (
                                            <span key={g} className="text-[11px] font-orbitron text-gray-300 bg-animePurple/10 border border-animePurple/20 px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold">{g}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "specifications" && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-sm text-animePurple-light font-bold font-orbitron uppercase tracking-widest mb-4">Detailed Profile Metadata</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">MAL Rank</span>
                                            <span className="text-white text-lg font-black font-orbitron mt-1">#{currentAnime.rank}</span>
                                        </div>
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Popularity Rank</span>
                                            <span className="text-white text-lg font-black font-orbitron mt-1">#{currentAnime.popularity}</span>
                                        </div>
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Total Members</span>
                                            <span className="text-white text-lg font-bold mt-1">{currentAnime.members}</span>
                                        </div>
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Scoring Users</span>
                                            <span className="text-white text-lg font-bold mt-1">{currentAnime.scorers}</span>
                                        </div>
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between lg:col-span-2">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Broadcast Schedule</span>
                                            <span className="text-white text-base font-semibold mt-1">{currentAnime.broadcast}</span>
                                        </div>
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Original Source</span>
                                            <span className="text-white text-base font-semibold mt-1">{currentAnime.source}</span>
                                        </div>
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Episode Duration</span>
                                            <span className="text-white text-base font-semibold mt-1">{currentAnime.duration}</span>
                                        </div>
                                        <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between lg:col-span-3">
                                            <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Age Classification</span>
                                            <span className="text-white text-base font-semibold mt-1">{currentAnime.ageRating}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
