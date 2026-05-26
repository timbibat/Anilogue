const { useState, useEffect } = React;
const apiService = window.apiService;

// SVG Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const PlayIcon = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
);

const StarIcon = () => (
    <svg className="w-3.5 h-3.5 fill-animeYellow text-animeYellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

window.DetailModal = function DetailModal({ anime, onClose, toggleBookmark, myList }) {
    const [activeTab, setActiveTab] = useState("specifications"); // 'specifications' | 'synopsis' | 'trailer'
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

    // Close modal on Escape Keypress
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    const currentAnime = detailedAnime || anime;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-md animate-fade-in">
            
            {/* Modal layout box */}
            <div className="relative w-full max-w-4xl bg-darkCard rounded-2xl overflow-hidden neon-border-purple border-2 animate-slide-up flex flex-col md:flex-row shadow-2xl min-h-[500px]">
                
                {/* Close button top right */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-40 w-10 h-10 rounded-full bg-darkBg/60 backdrop-blur-md border border-animePurple/20 text-white hover:border-animePurple flex items-center justify-center cursor-pointer transition-colors"
                >
                    <CloseIcon />
                </button>

                {loading ? (
                    <div className="w-full flex items-center justify-center min-h-[400px]">
                        <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Left Side: Gorgeous Profile Showcase Poster & Trailer Player */}
                        <div className="w-full md:w-3/5 bg-black relative flex flex-col justify-between border-b md:border-b-0 md:border-r border-animePurple/20">
                            
                            {activeTab === 'trailer' ? (
                                <div className="w-full h-full min-h-[250px] sm:min-h-[350px] bg-black">
                                    <iframe 
                                        src={currentAnime.trailer} 
                                        title="Anime Trailer" 
                                        className="w-full h-full"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <div className="relative w-full h-[250px] sm:h-full min-h-[350px] overflow-hidden flex flex-col justify-end p-6">
                                    <img 
                                        src={currentAnime.banner || currentAnime.cover} 
                                        alt={currentAnime.title} 
                                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                                    />
                                    {/* Vignette styling gradients */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent"></div>
                                    
                                    {/* Profile Showcase Overlay */}
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex justify-center mb-6">
                                            <div className="w-16 h-16 rounded-full bg-animePurple/95 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-animePurple/45 border-2 border-white/20" onClick={() => setActiveTab("trailer")}>
                                                <PlayIcon className="w-7 h-7 text-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-[10px] text-animePurple-light font-orbitron tracking-widest font-black uppercase">DATABASE PROFILE</span>
                                            <h4 className="text-lg font-bold text-white leading-tight">{currentAnime.title}</h4>
                                            <p className="text-xs text-gray-300">Synchronized live with MyAnimeList API v2</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Right Side: Specifications / Detail Tabs */}
                        <div className="w-full md:w-2/5 p-6 flex flex-col justify-between text-left space-y-4 bg-darkCard">
                            
                            {/* Modal metadata headings */}
                            <div className="space-y-2">
                                <span className="bg-animePurple/15 text-animePurple-light text-[10px] font-extrabold px-2.5 py-1 rounded font-orbitron tracking-wide border border-animePurple/20 uppercase">
                                    {currentAnime.type}
                                </span>
                                <h3 className="font-orbitron font-extrabold text-xl sm:text-2xl text-white leading-snug drop-shadow-sm line-clamp-2">
                                    {currentAnime.title}
                                </h3>
                                <div className="flex items-center space-x-3 text-xs text-gray-400 font-semibold">
                                    <span className="flex items-center text-animeYellow space-x-1">
                                        <StarIcon />
                                        <span>{currentAnime.rating} Score</span>
                                    </span>
                                    <span>{currentAnime.year}</span>
                                    <span>{currentAnime.episodes} Eps</span>
                                </div>
                            </div>

                            {/* Section Switcher Tabs */}
                            <div className="flex border-b border-animePurple/10 text-xs font-semibold">
                                <button 
                                    onClick={() => setActiveTab("specifications")}
                                    className={`py-2 px-3 focus:outline-none cursor-pointer uppercase ${activeTab === 'specifications' ? 'border-b-2 border-animePurple text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Specifications
                                </button>
                                <button 
                                    onClick={() => setActiveTab("synopsis")}
                                    className={`py-2 px-3 focus:outline-none cursor-pointer uppercase ${activeTab === 'synopsis' ? 'border-b-2 border-animePurple text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Synopsis & Bio
                                </button>
                                <button 
                                    onClick={() => setActiveTab("trailer")}
                                    className={`py-2 px-3 focus:outline-none cursor-pointer uppercase ${activeTab === 'trailer' ? 'border-b-2 border-animePurple text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Teaser PV
                                </button>
                            </div>

                            {/* Dynamic tab contents frame */}
                            <div className="flex-grow overflow-y-auto max-h-[240px] pr-2 no-scrollbar">
                                
                                {activeTab === "synopsis" && (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] text-animePurple-light font-bold font-orbitron uppercase tracking-widest">MAL Synopsis:</span>
                                            <p className="text-gray-400 text-xs leading-relaxed">
                                                {currentAnime.synopsis}
                                            </p>
                                        </div>

                                        {currentAnime.background && (
                                            <div className="space-y-1 border-t border-animePurple/10 pt-2">
                                                <span className="text-[9px] text-animeYellow font-bold font-orbitron uppercase tracking-widest">Production Background Notes:</span>
                                                <p className="text-gray-500 text-xs leading-relaxed italic">
                                                    {currentAnime.background}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Display Studio if available */}
                                        {currentAnime.studios && currentAnime.studios.length > 0 && (
                                            <div className="text-xs text-gray-500 font-semibold border-t border-animePurple/10 pt-2">
                                                Studio: <span className="text-animePurple-light">{currentAnime.studios.join(", ")}</span>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {currentAnime.genres.map(g => (
                                                <span key={g} className="text-[10px] text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{g}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "trailer" && (
                                    <div className="space-y-2 py-4">
                                        <p className="text-xs text-gray-400">Official PV Teaser trailer. Play directly on the video window frame on the left side.</p>
                                        <button 
                                            onClick={() => setActiveTab("specifications")}
                                            className="text-xs text-animePurple hover:underline font-bold mt-2 cursor-pointer flex items-center space-x-1"
                                        >
                                            <span>Return to Specifications</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                        </button>
                                    </div>
                                )}

                                {activeTab === "specifications" && (
                                    <div className="space-y-4">
                                        {/* Premium specifications grid */}
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">MAL Rank:</span>
                                                <span className="text-white font-extrabold font-orbitron">#{currentAnime.rank}</span>
                                            </div>
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">Popularity Rank:</span>
                                                <span className="text-white font-extrabold font-orbitron">#{currentAnime.popularity}</span>
                                            </div>
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">List Members:</span>
                                                <span className="text-white font-bold">{currentAnime.members}</span>
                                            </div>
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">Scoring Users:</span>
                                                <span className="text-white font-bold">{currentAnime.scorers}</span>
                                            </div>
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md col-span-2">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">Broadcast Schedule:</span>
                                                <span className="text-white font-medium">{currentAnime.broadcast}</span>
                                            </div>
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">Original Source:</span>
                                                <span className="text-white font-medium">{currentAnime.source}</span>
                                            </div>
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">Episode Duration:</span>
                                                <span className="text-white font-medium">{currentAnime.duration}</span>
                                            </div>
                                            <div className="bg-darkBg/60 border border-animePurple/10 p-2 rounded-md col-span-2">
                                                <span className="text-[9px] text-gray-500 block font-orbitron uppercase tracking-wider">Age Classification:</span>
                                                <span className="text-white font-medium">{currentAnime.ageRating}</span>
                                            </div>
                                        </div>

                                        <a 
                                            href={`https://myanimelist.net/anime/${currentAnime.id}`} 
                                            target="_blank" 
                                            rel="noopener"
                                            className="text-xs text-animePurple hover:underline font-bold mt-4 cursor-pointer flex items-center space-x-1.5 justify-center py-2 bg-darkBg/90 rounded border border-animePurple/20 hover:border-animePurple transition-all"
                                        >
                                            <span>View Profile on MyAnimeList</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                        </a>
                                    </div>
                                )}

                            </div>

                            {/* Dynamic watchlist interactions footer */}
                            <div className="pt-4 border-t border-animePurple/10 flex items-center justify-between gap-4">
                                <button 
                                    onClick={() => toggleBookmark(currentAnime.id)}
                                    className={`w-full py-2.5 rounded font-orbitron font-bold text-xs tracking-wider border flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer ${isBookmarked ? 'bg-animeYellow/10 border-animeYellow text-animeYellow' : 'border-animePurple/30 text-white hover:border-animePurple hover:bg-animePurple/10'}`}
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
                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
