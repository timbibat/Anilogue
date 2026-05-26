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

window.DetailPage = function DetailPage({ anime, onClose, toggleBookmark, myList, type = "anime", isLoggedIn = false, authType = null }) {
    const [activeTab, setActiveTab] = useState("specifications"); // 'specifications' | 'synopsis'
    const [detailedAnime, setDetailedAnime] = useState(null);
    const [loading, setLoading] = useState(true);

    // Watchlist synchronizer state bindings
    const [malStatus, setMalStatus] = useState("plan_to_watch");
    const [malProgress, setMalProgress] = useState(0);
    const [malVolsProgress, setMalVolsProgress] = useState(0); // Manga only
    const [malScore, setMalScore] = useState(0);
    const [isUpdatingMAL, setIsUpdatingMAL] = useState(false);

    const isBookmarked = myList.includes(anime.id);

    // Fetch full details on mount
    useEffect(() => {
        let isMounted = true;
        async function fetchDetails() {
            setLoading(true);
            try {
                const data = type === "manga" 
                    ? await apiService.getMangaDetails(anime.id)
                    : await apiService.getAnimeDetails(anime.id);
                if (isMounted) {
                    if (data && !data.isUnconfigured) {
                        setDetailedAnime(data);
                    } else {
                        setDetailedAnime(anime);
                    }
                }
            } catch (err) {
                console.error("Error loading details:", err);
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
    }, [anime, type]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [anime]);

    const currentAnime = detailedAnime || anime;

    // Synchronize form bindings with loaded detailed item my_list_status
    useEffect(() => {
        if (currentAnime && currentAnime.my_list_status) {
            const ls = currentAnime.my_list_status;
            if (ls.status) setMalStatus(ls.status);
            if (type === "manga") {
                if (ls.num_chapters_read !== undefined) setMalProgress(ls.num_chapters_read);
                if (ls.num_volumes_read !== undefined) setMalVolsProgress(ls.num_volumes_read);
            } else {
                if (ls.num_episodes_watched !== undefined) setMalProgress(ls.num_episodes_watched);
            }
            if (ls.score !== undefined) setMalScore(ls.score);
        } else {
            // Default statuses depending on type
            setMalStatus(type === "manga" ? "plan_to_read" : "plan_to_watch");
            setMalProgress(0);
            setMalVolsProgress(0);
            setMalScore(0);
        }
    }, [detailedAnime, type]);

    const handleMALSync = async () => {
        setIsUpdatingMAL(true);
        try {
            if (authType === 'local') {
                // Save to local database
                const res = await apiService.saveToDBWatchlist(
                    currentAnime.id, type, malStatus, malProgress, malVolsProgress, malScore
                );
                if (res && res.success) {
                    if (!isBookmarked) {
                        toggleBookmark(currentAnime.id, type);
                    }
                    alert("Successfully saved to your watchlist!");
                } else {
                    alert("Error saving: " + (res ? res.error : "Unknown error"));
                }
            } else {
                // Sync to MyAnimeList
                const extraFields = {
                    score: malScore
                };
                if (type === "manga") {
                    extraFields.num_chapters_read = malProgress;
                    extraFields.num_volumes_read = malVolsProgress;
                } else {
                    extraFields.num_watched_episodes = malProgress;
                }
                const res = await apiService.updateMALListStatus(currentAnime.id, malStatus, type, extraFields);
                if (res && !res.error) {
                    setDetailedAnime(prev => ({
                        ...prev,
                        my_list_status: res
                    }));
                    if (!isBookmarked) {
                        toggleBookmark(currentAnime.id, type);
                    }
                    alert("Successfully synchronized status to MyAnimeList!");
                } else {
                    alert("Error synchronizing status: " + (res ? res.error : "Unknown error"));
                }
            }
        } catch (e) {
            console.error("Failed to sync:", e);
            alert("Connection error. Please try again.");
        } finally {
            setIsUpdatingMAL(false);
        }
    };

    const handleMALDelete = async () => {
        if (!confirm("Are you sure you want to remove this from your watchlist entirely?")) return;
        setIsUpdatingMAL(true);
        try {
            if (authType === 'local') {
                const res = await apiService.deleteFromDBWatchlist(currentAnime.id, type);
                if (res && res.success) {
                    if (isBookmarked) {
                        toggleBookmark(currentAnime.id, type);
                    }
                    setMalStatus(type === "manga" ? "plan_to_read" : "plan_to_watch");
                    setMalProgress(0);
                    setMalVolsProgress(0);
                    setMalScore(0);
                    alert("Removed from your watchlist successfully!");
                } else {
                    alert("Error removing: " + (res ? res.error : "Unknown error"));
                }
            } else {
                const res = await apiService.deleteMALListItem(currentAnime.id, type);
                if (res && !res.error) {
                    setDetailedAnime(prev => ({
                        ...prev,
                        my_list_status: null
                    }));
                    if (isBookmarked) {
                        toggleBookmark(currentAnime.id, type);
                    }
                    setMalStatus(type === "manga" ? "plan_to_read" : "plan_to_watch");
                    setMalProgress(0);
                    setMalVolsProgress(0);
                    setMalScore(0);
                    alert("Removed from MyAnimeList successfully!");
                } else {
                    alert("Error removing from MyAnimeList: " + (res ? res.error : "Unknown error"));
                }
            }
        } catch (e) {
            console.error("Failed to delete:", e);
            alert("Connection error. Please try again.");
        } finally {
            setIsUpdatingMAL(false);
        }
    };

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
                            <span>{type === "manga" ? `${currentAnime.chapters} Chapters / ${currentAnime.volumes} Volumes` : `${currentAnime.episodes} Episodes`}</span>
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
                        <div className="w-64 lg:w-full space-y-4">
                            {/* Premium MAL Live Synchronizer Panel */}
                            {isLoggedIn ? (
                                <div className="w-full bg-[#121212] border border-gray-800 rounded-lg p-5 shadow-2xl space-y-4 text-xs font-sans text-white select-none">
                                    {/* Underlined Header Title */}
                                    <div className="text-left font-bold text-sm pb-1 mb-2 border-b border-[#2e51a2] text-white tracking-wide">
                                        Add to List
                                    </div>
                                    
                                    {/* Red warning note */}
                                    <div className="text-[11px] text-[#ff4d4d] font-semibold">
                                        * Your list is public by default.
                                    </div>
                                    
                                    {/* Form Fields Aligned horizontally */}
                                    <div className="space-y-3.5">
                                        {/* Status Row */}
                                        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                            <label className="text-gray-300 font-bold text-right pr-2">Status:</label>
                                            <div className="relative">
                                                <select 
                                                    value={malStatus} 
                                                    onChange={(e) => setMalStatus(e.target.value)}
                                                    className="w-full bg-[#2c2c2c] hover:bg-[#333333] border border-[#444444] text-white text-xs rounded px-2.5 py-1.5 cursor-pointer outline-none transition-colors appearance-none pr-8 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                >
                                                    {type === "manga" ? (
                                                        <>
                                                            <option value="reading">Reading</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="on_hold">On-Hold</option>
                                                            <option value="dropped">Dropped</option>
                                                            <option value="plan_to_read">Plan to Watch</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="watching">Watching</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="on_hold">On-Hold</option>
                                                            <option value="dropped">Dropped</option>
                                                            <option value="plan_to_watch">Plan to Watch</option>
                                                        </>
                                                    )}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Row (Eps Seen or Chaps/Vols Seen) */}
                                        {type === "manga" ? (
                                            <>
                                                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                                    <label className="text-gray-300 font-bold text-right pr-2">Chaps Seen:</label>
                                                    <div className="flex items-center space-x-2">
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            max={currentAnime.chapters !== 'N/A' ? currentAnime.chapters : 9999}
                                                            value={malProgress} 
                                                            onChange={(e) => setMalProgress(parseInt(e.target.value) || 0)}
                                                            className="w-16 bg-[#2c2c2c] border border-[#444444] text-white text-xs rounded px-2 py-1 text-center focus:outline-none focus:border-blue-500"
                                                        />
                                                        <span className="text-gray-400 font-bold">/ {currentAnime.chapters !== 'N/A' && currentAnime.chapters ? currentAnime.chapters : '??'}</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                                    <label className="text-gray-300 font-bold text-right pr-2">Vols Seen:</label>
                                                    <div className="flex items-center space-x-2">
                                                        <input 
                                                            type="number" 
                                                            min="0" 
                                                            max={currentAnime.volumes !== 'N/A' ? currentAnime.volumes : 999}
                                                            value={malVolsProgress} 
                                                            onChange={(e) => setMalVolsProgress(parseInt(e.target.value) || 0)}
                                                            className="w-16 bg-[#2c2c2c] border border-[#444444] text-white text-xs rounded px-2 py-1 text-center focus:outline-none focus:border-blue-500"
                                                        />
                                                        <span className="text-gray-400 font-bold">/ {currentAnime.volumes !== 'N/A' && currentAnime.volumes ? currentAnime.volumes : '??'}</span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                                <label className="text-gray-300 font-bold text-right pr-2">Eps Seen:</label>
                                                <div className="flex items-center space-x-2">
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max={currentAnime.episodes !== 'N/A' ? currentAnime.episodes : 999}
                                                        value={malProgress} 
                                                        onChange={(e) => setMalProgress(parseInt(e.target.value) || 0)}
                                                        className="w-16 bg-[#2c2c2c] border border-[#444444] text-white text-xs rounded px-2 py-1 text-center focus:outline-none focus:border-blue-500"
                                                    />
                                                    <span className="text-gray-400 font-bold">/ {currentAnime.episodes !== 'N/A' && currentAnime.episodes ? currentAnime.episodes : '??'}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Your Score Row */}
                                        <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                            <label className="text-gray-300 font-bold text-right pr-2">Your Score:</label>
                                            <div className="relative">
                                                <select 
                                                    value={malScore} 
                                                    onChange={(e) => setMalScore(parseInt(e.target.value) || 0)}
                                                    className="w-full bg-[#2c2c2c] hover:bg-[#333333] border border-[#444444] text-white text-xs rounded px-2.5 py-1.5 cursor-pointer outline-none transition-colors appearance-none pr-8 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="0">Select</option>
                                                    <option value="10">10 (Masterpiece)</option>
                                                    <option value="9">9 (Great)</option>
                                                    <option value="8">8 (Very Good)</option>
                                                    <option value="7">7 (Good)</option>
                                                    <option value="6">6 (Fine)</option>
                                                    <option value="5">5 (Average)</option>
                                                    <option value="4">4 (Bad)</option>
                                                    <option value="3">3 (Very Bad)</option>
                                                    <option value="2">2 (Horrible)</option>
                                                    <option value="1">1 (Appalling)</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons Row */}
                                    <div className="pt-2 flex items-center space-x-3 pl-[90px]">
                                        <button 
                                            onClick={handleMALSync}
                                            disabled={isUpdatingMAL}
                                            className="px-5 py-1.5 bg-[#2e51a2] text-white hover:bg-[#3b5ca9] font-bold text-xs rounded shadow-md transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
                                        >
                                            {isUpdatingMAL ? 'Syncing...' : (currentAnime.my_list_status ? 'Save' : 'Add')}
                                        </button>
                                        
                                        {currentAnime.my_list_status ? (
                                            <button 
                                                onClick={handleMALDelete}
                                                disabled={isUpdatingMAL}
                                                className="text-red-400 hover:text-red-300 font-semibold text-xs transition-colors cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        ) : (
                                            <span className="text-[#2e51a2] hover:underline font-semibold text-xs cursor-pointer">
                                                Add Detailed Info
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => toggleBookmark(currentAnime.id, type)}
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
                            )}

                            <a 
                                href={type === "manga" ? `https://myanimelist.net/manga/${currentAnime.id}` : `https://myanimelist.net/anime/${currentAnime.id}`} 
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
                                        {type === "manga" ? (
                                            <>
                                                <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                                    <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Total Chapters</span>
                                                    <span className="text-white text-base font-semibold mt-1">{currentAnime.chapters}</span>
                                                </div>
                                                <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                                    <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Total Volumes</span>
                                                    <span className="text-white text-base font-semibold mt-1">{currentAnime.volumes}</span>
                                                </div>
                                                <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between">
                                                    <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Serialization</span>
                                                    <span className="text-white text-base font-semibold mt-1">{currentAnime.serialization}</span>
                                                </div>
                                                <div className="bg-darkBg/80 border border-animePurple/10 p-4 rounded-xl flex flex-col justify-between lg:col-span-2">
                                                    <span className="text-[10px] text-gray-500 block font-orbitron uppercase tracking-wider">Authors / Creators</span>
                                                    <span className="text-white text-base font-semibold mt-1">{currentAnime.authors}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
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
