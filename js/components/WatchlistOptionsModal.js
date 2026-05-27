const { useState, useEffect } = React;
const apiService = window.apiService;

// SVG Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

window.WatchlistOptionsModal = function WatchlistOptionsModal({ item, isLoggedIn, authType, onClose, onSaveSuccess, myList }) {
    const [detailedItem, setDetailedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form inputs
    const [status, setStatus] = useState(item.type === "manga" ? "plan_to_read" : "plan_to_watch");
    const [progress, setProgress] = useState(0);
    const [volsProgress, setVolsProgress] = useState(0); // Manga only
    const [score, setScore] = useState(0);

    const isBookmarked = myList.includes(item.id);

    // Fetch details
    useEffect(() => {
        let isMounted = true;
        async function fetchDetails() {
            setLoading(true);
            try {
                const data = item.type === "manga"
                    ? await apiService.getMangaDetails(item.id)
                    : await apiService.getAnimeDetails(item.id);
                if (isMounted) {
                    let finalData = data && !data.isUnconfigured ? data : item;
                    
                    // Inject local storage status for guest users
                    if (!isLoggedIn) {
                        const savedDetails = localStorage.getItem("guestWatchlistDetails") ? JSON.parse(localStorage.getItem("guestWatchlistDetails")) : {};
                        const guestItem = savedDetails[item.id];
                        if (guestItem) {
                            finalData.my_list_status = {
                                status: guestItem.status,
                                score: guestItem.score,
                                num_episodes_watched: guestItem.progress,
                                num_chapters_read: guestItem.progress,
                                num_volumes_read: guestItem.volumes_progress
                            };
                        }
                    }

                    setDetailedItem(finalData);

                    // Sync initial inputs
                    if (finalData && finalData.my_list_status) {
                        const ls = finalData.my_list_status;
                        if (ls.status) setStatus(ls.status);
                        if (item.type === "manga") {
                            if (ls.num_chapters_read !== undefined) setProgress(ls.num_chapters_read);
                            if (ls.num_volumes_read !== undefined) setVolsProgress(ls.num_volumes_read);
                        } else {
                            if (ls.num_episodes_watched !== undefined) setProgress(ls.num_episodes_watched);
                        }
                        if (ls.score !== undefined) setScore(ls.score);
                    }
                }
            } catch (err) {
                console.error("Error loading options modal details:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchDetails();
        return () => { isMounted = false; };
    }, [item, isLoggedIn]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!isLoggedIn) {
                // Save to guest localStorage details
                const savedDetails = localStorage.getItem("guestWatchlistDetails") ? JSON.parse(localStorage.getItem("guestWatchlistDetails")) : {};
                savedDetails[item.id] = {
                    media_id: item.id,
                    media_type: item.type,
                    status: status,
                    progress: progress,
                    volumes_progress: volsProgress,
                    score: score
                };
                localStorage.setItem("guestWatchlistDetails", JSON.stringify(savedDetails));

                // Add to guest list
                if (!isBookmarked) {
                    const key = item.type === "manga" ? "guestMangaWatchlist" : "guestWatchlist";
                    const savedList = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
                    if (!savedList.includes(item.id)) {
                        savedList.push(item.id);
                        localStorage.setItem(key, JSON.stringify(savedList));
                    }
                }
                alert("Successfully saved to your local guest watchlist!");
                onSaveSuccess();
                onClose();
            } else {
                // Sync to MAL
                const extraFields = { score };
                if (item.type === "manga") {
                    extraFields.num_chapters_read = progress;
                    extraFields.num_volumes_read = volsProgress;
                } else {
                    extraFields.num_watched_episodes = progress;
                }
                const res = await apiService.updateMALListStatus(item.id, status, item.type, extraFields);
                if (res && !res.error) {
                    alert("Successfully synchronized to MyAnimeList!");
                    onSaveSuccess();
                    onClose();
                } else {
                    alert("Error synchronizing: " + (res ? res.error : "Unknown error"));
                }
            }
        } catch (e) {
            console.error("Watchlist save failed:", e);
            alert("Connection error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to remove this from your watchlist?")) return;
        setIsSaving(true);
        try {
            if (!isLoggedIn) {
                // Delete from guest details
                const savedDetails = localStorage.getItem("guestWatchlistDetails") ? JSON.parse(localStorage.getItem("guestWatchlistDetails")) : {};
                delete savedDetails[item.id];
                localStorage.setItem("guestWatchlistDetails", JSON.stringify(savedDetails));

                // Remove from list
                const key = item.type === "manga" ? "guestMangaWatchlist" : "guestWatchlist";
                const savedList = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : [];
                const updatedList = savedList.filter(id => id !== item.id);
                localStorage.setItem(key, JSON.stringify(updatedList));

                alert("Removed from local guest watchlist successfully!");
                onSaveSuccess();
                onClose();
            } else {
                const res = await apiService.deleteMALListItem(item.id, item.type);
                if (res && !res.error) {
                    alert("Removed from MyAnimeList successfully!");
                    onSaveSuccess();
                    onClose();
                } else {
                    alert("Error removing: " + (res ? res.error : "Unknown error"));
                }
            }
        } catch (e) {
            console.error("Watchlist delete failed:", e);
            alert("Connection error. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const currentItem = detailedItem || item;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-md">
            <div className="relative w-full max-w-sm bg-darkCard/95 border-2 border-animePurple rounded-xl p-6 text-center shadow-2xl glass-effect animate-slide-up">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                    <CloseIcon />
                </button>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-400 font-orbitron tracking-widest animate-pulse">SYNCHRONIZING OPTIONS...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Header Details */}
                        <div className="text-left flex items-start space-x-3.5 border-b border-animePurple/20 pb-4">
                            <div className="w-14 h-20 rounded-md overflow-hidden flex-none border border-animePurple/30">
                                <img src={currentItem.cover} alt={currentItem.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                                <span className="bg-animePurple/20 text-animePurple-light text-[9px] font-bold px-2 py-0.5 rounded font-orbitron uppercase tracking-wider border border-animePurple/35">
                                    {currentItem.type || "Anime"}
                                </span>
                                <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight">
                                    {currentItem.title}
                                </h3>
                                <p className="text-[10px] text-gray-400">
                                    {currentItem.type === "manga" ? `${currentItem.chapters || '??'} Chapters` : `${currentItem.episodes || '??'} Episodes`}
                                </p>
                            </div>
                        </div>

                        {/* Watchlist Options Form */}
                        <div className="space-y-4 text-left text-xs font-sans text-white select-none">
                            {/* Status Select */}
                            <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                <label className="text-gray-300 font-bold text-right pr-2">Status:</label>
                                <div className="relative">
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-[#2c2c2c] hover:bg-[#333333] border border-[#444444] text-white text-xs rounded px-2.5 py-1.5 cursor-pointer outline-none appearance-none pr-8 focus:border-animePurple"
                                    >
                                        {item.type === "manga" ? (
                                            <>
                                                <option value="reading">Reading</option>
                                                <option value="completed">Completed</option>
                                                <option value="on_hold">On-Hold</option>
                                                <option value="dropped">Dropped</option>
                                                <option value="plan_to_read">Plan to Read</option>
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

                            {/* Progress seen row */}
                            {item.type === "manga" ? (
                                <>
                                    <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                        <label className="text-gray-300 font-bold text-right pr-2">Chaps Seen:</label>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max={currentItem.chapters !== 'N/A' && currentItem.chapters ? currentItem.chapters : 9999}
                                                value={progress} 
                                                onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                                                className="w-16 bg-[#2c2c2c] border border-[#444444] text-white text-xs rounded px-2 py-1 text-center focus:outline-none focus:border-animePurple"
                                            />
                                            <span className="text-gray-400 font-bold">/ {currentItem.chapters !== 'N/A' && currentItem.chapters ? currentItem.chapters : '??'}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                        <label className="text-gray-300 font-bold text-right pr-2">Vols Seen:</label>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max={currentItem.volumes !== 'N/A' && currentItem.volumes ? currentItem.volumes : 999}
                                                value={volsProgress} 
                                                onChange={(e) => setVolsProgress(parseInt(e.target.value) || 0)}
                                                className="w-16 bg-[#2c2c2c] border border-[#444444] text-white text-xs rounded px-2 py-1 text-center focus:outline-none focus:border-animePurple"
                                            />
                                            <span className="text-gray-400 font-bold">/ {currentItem.volumes !== 'N/A' && currentItem.volumes ? currentItem.volumes : '??'}</span>
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
                                            max={currentItem.episodes !== 'N/A' && currentItem.episodes ? currentItem.episodes : 999}
                                            value={progress} 
                                            onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                                            className="w-16 bg-[#2c2c2c] border border-[#444444] text-white text-xs rounded px-2 py-1 text-center focus:outline-none focus:border-animePurple"
                                        />
                                        <span className="text-gray-400 font-bold">/ {currentItem.episodes !== 'N/A' && currentItem.episodes ? currentItem.episodes : '??'}</span>
                                    </div>
                                </div>
                            )}

                            {/* Score select row */}
                            {authType === 'mal' ? (
                                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                    <label className="text-gray-300 font-bold text-right pr-2">Your Score:</label>
                                    <div className="relative">
                                        <select 
                                            value={score} 
                                            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                                            className="w-full bg-[#2c2c2c] hover:bg-[#333333] border border-[#444444] text-white text-xs rounded px-2.5 py-1.5 cursor-pointer outline-none appearance-none pr-8 focus:border-animePurple"
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
                            ) : (
                                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                                    <label className="text-gray-300 font-bold text-right pr-2">Scoring:</label>
                                    <button 
                                        type="button"
                                        onClick={() => window.location.href = 'api/auth.php?action=login'}
                                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-orbitron font-bold text-[10px] tracking-wider rounded flex items-center justify-center space-x-1.5 transition-all active:scale-95 border border-blue-500/25 shadow-md shadow-blue-600/10 cursor-pointer text-center"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1.85 14.82l-3.32-3.32a.74.74 0 111.05-1.05l2.27 2.27 5.09-5.09a.74.74 0 111.05 1.05l-5.61 5.61a.73.73 0 01-1.05 0z"/></svg>
                                        <span>CONTINUE WITH MAL ACCOUNT</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 flex items-center justify-end space-x-3 border-t border-animePurple/15 select-none">
                            {isBookmarked && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isSaving}
                                    className="text-red-400 hover:text-red-300 font-bold text-xs tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                                >
                                    Remove
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-white/10 rounded text-xs text-gray-300 hover:text-white hover:border-white/20 transition-all font-orbitron font-bold tracking-wider cursor-pointer"
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-gradient-to-r from-animePurple to-purple-800 text-white hover:from-purple-500 hover:to-purple-700 font-orbitron font-black text-xs tracking-widest rounded shadow-md shadow-animePurple/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSaving ? "SAVING..." : (isBookmarked ? "UPDATE" : "SAVE")}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
