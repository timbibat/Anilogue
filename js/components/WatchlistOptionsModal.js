const { useState, useEffect } = React;
const apiService = window.apiService;

// SVG Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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

    // Date States
    const [startYear, setStartYear] = useState("");
    const [startMonth, setStartMonth] = useState("");
    const [startDay, setStartDay] = useState("");
    const [finishYear, setFinishYear] = useState("");
    const [finishMonth, setFinishMonth] = useState("");
    const [finishDay, setFinishDay] = useState("");

    // Advanced inputs
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [rewatchedTimes, setRewatchedTimes] = useState(0);
    const [priority, setPriority] = useState("0");
    const [comments, setComments] = useState("");
    const [tags, setTags] = useState("");

    const isBookmarked = myList.includes(item.id);

    // Helpers to generate date arrays
    const months = [
        { label: "Month", value: "" },
        { label: "Jan", value: "01" },
        { label: "Feb", value: "02" },
        { label: "Mar", value: "03" },
        { label: "Apr", value: "04" },
        { label: "May", value: "05" },
        { label: "Jun", value: "06" },
        { label: "Jul", value: "07" },
        { label: "Aug", value: "08" },
        { label: "Sep", value: "09" },
        { label: "Oct", value: "10" },
        { label: "Nov", value: "11" },
        { label: "Dec", value: "12" }
    ];

    const currentYear = new Date().getFullYear();
    const years = ["Year", ...Array.from({ length: 70 }, (_, i) => String(currentYear - i))];
    const days = ["Day", ...Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))];

    // Handle Date Helper Actions
    const handleInsertToday = (type) => {
        const today = new Date();
        const y = String(today.getFullYear());
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');

        if (type === 'start') {
            setStartYear(y);
            setStartMonth(m);
            setStartDay(d);
        } else {
            setFinishYear(y);
            setFinishMonth(m);
            setFinishDay(d);
        }
    };

    const handleClearDate = (type) => {
        if (type === 'start') {
            setStartYear("");
            setStartMonth("");
            setStartDay("");
        } else {
            setFinishYear("");
            setFinishMonth("");
            setFinishDay("");
        }
    };

    // Construct Date strings (YYYY-MM-DD or partial or empty)
    const getFormattedDate = (y, m, d) => {
        if (!y && !m && !d) return "";
        return `${y || "0000"}-${m || "00"}-${d || "00"}`;
    };

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
                                num_volumes_read: guestItem.volumes_progress,
                                start_date: guestItem.start_date,
                                finish_date: guestItem.finish_date,
                                comments: guestItem.comments,
                                priority: guestItem.priority,
                                num_times_rewatched: guestItem.num_times_rewatched,
                                num_times_reread: guestItem.num_times_reread
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
                            if (ls.num_times_reread !== undefined) setRewatchedTimes(ls.num_times_reread);
                        } else {
                            if (ls.num_episodes_watched !== undefined) setProgress(ls.num_episodes_watched);
                            if (ls.num_times_rewatched !== undefined) setRewatchedTimes(ls.num_times_rewatched);
                        }
                        if (ls.score !== undefined) setScore(ls.score);

                        // Dates
                        if (ls.start_date) {
                            const parts = ls.start_date.split("-");
                            if (parts[0] && parts[0] !== "0000") setStartYear(parts[0]);
                            if (parts[1] && parts[1] !== "00") setStartMonth(parts[1]);
                            if (parts[2] && parts[2] !== "00") setStartDay(parts[2]);
                        }
                        if (ls.finish_date) {
                            const parts = ls.finish_date.split("-");
                            if (parts[0] && parts[0] !== "0000") setFinishYear(parts[0]);
                            if (parts[1] && parts[1] !== "00") setFinishMonth(parts[1]);
                            if (parts[2] && parts[2] !== "00") setFinishDay(parts[2]);
                        }

                        // Advanced
                        if (ls.priority !== undefined) setPriority(String(ls.priority));
                        if (ls.comments) setComments(ls.comments);
                        if (ls.tags) setTags(typeof ls.tags === 'string' ? ls.tags : (Array.isArray(ls.tags) ? ls.tags.join(', ') : ''));
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
        const startDateFormatted = getFormattedDate(startYear, startMonth, startDay);
        const finishDateFormatted = getFormattedDate(finishYear, finishMonth, finishDay);

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
                    score: score,
                    start_date: startDateFormatted,
                    finish_date: finishDateFormatted,
                    comments: comments,
                    priority: parseInt(priority) || 0,
                    num_times_rewatched: item.type !== "manga" ? rewatchedTimes : 0,
                    num_times_reread: item.type === "manga" ? rewatchedTimes : 0
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
                const extraFields = { 
                    score,
                    start_date: startDateFormatted,
                    finish_date: finishDateFormatted,
                    priority: parseInt(priority) || 0,
                    comments: comments,
                    tags: tags
                };
                if (item.type === "manga") {
                    extraFields.num_chapters_read = progress;
                    extraFields.num_volumes_read = volsProgress;
                    extraFields.num_times_reread = rewatchedTimes;
                } else {
                    extraFields.num_watched_episodes = progress;
                    extraFields.num_times_rewatched = rewatchedTimes;
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

    // Detect if date matches today
    const today = new Date();
    const todayY = String(today.getFullYear());
    const todayM = String(today.getMonth() + 1).padStart(2, '0');
    const todayD = String(today.getDate()).padStart(2, '0');

    const isStartToday = startYear === todayY && startMonth === todayM && startDay === todayD;
    const isStartUnknown = !startYear && !startMonth && !startDay;

    const isFinishToday = finishYear === todayY && finishMonth === todayM && finishDay === todayD;
    const isFinishUnknown = !finishYear && !finishMonth && !finishDay;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="relative w-full max-w-[640px] bg-[#1a1a1a] border border-[#2b2b2b] rounded-md text-gray-200 shadow-2xl font-sans text-xs">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2b2b2b]">
                    <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white text-[13px]">
                            Edit {item.type === "manga" ? "Manga" : "Anime"}
                        </span>
                        <span className="text-[#ff4e4e] text-[11px] font-normal pl-1">
                            * Your list is public by default.
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white cursor-pointer transition-colors"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[11px] text-gray-400 font-medium tracking-wide">Loading status details...</p>
                    </div>
                ) : (
                    <div className="p-5 space-y-4">
                        {/* Title block */}
                        <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                            <div className="text-gray-400 font-bold text-right pr-3">
                                {item.type === "manga" ? "Manga" : "Anime"} Title
                            </div>
                            <div className="font-bold text-[#4f84c4] text-[13px]">
                                {currentItem.title}
                            </div>
                        </div>

                        {/* Status Select */}
                        <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                            <label className="text-gray-400 font-bold text-right pr-3">Status</label>
                            <div>
                                <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-2 py-1.5 cursor-pointer outline-none focus:border-[#4f84c4] min-w-[150px]"
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
                            </div>
                        </div>

                        {/* Progress row */}
                        {item.type === "manga" ? (
                            <>
                                <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                                    <label className="text-gray-400 font-bold text-right pr-3">Chapters Read</label>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max={currentItem.chapters !== 'N/A' && currentItem.chapters ? currentItem.chapters : 9999}
                                            value={progress} 
                                            onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                                            className="w-16 bg-[#242424] border border-[#3c3c3c] text-white text-xs rounded py-1 px-2 text-center focus:outline-none focus:border-[#4f84c4]"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setProgress(prev => prev + 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-[#333] hover:bg-[#444] rounded text-white font-bold cursor-pointer"
                                        >
                                            +
                                        </button>
                                        <span className="text-gray-400 font-bold pl-1">/ {currentItem.chapters !== 'N/A' && currentItem.chapters ? currentItem.chapters : '??'}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                                    <label className="text-gray-400 font-bold text-right pr-3">Volumes Read</label>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max={currentItem.volumes !== 'N/A' && currentItem.volumes ? currentItem.volumes : 999}
                                            value={volsProgress} 
                                            onChange={(e) => setVolsProgress(parseInt(e.target.value) || 0)}
                                            className="w-16 bg-[#242424] border border-[#3c3c3c] text-white text-xs rounded py-1 px-2 text-center focus:outline-none focus:border-[#4f84c4]"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setVolsProgress(prev => prev + 1)}
                                            className="w-6 h-6 flex items-center justify-center bg-[#333] hover:bg-[#444] rounded text-white font-bold cursor-pointer"
                                        >
                                            +
                                        </button>
                                        <span className="text-gray-400 font-bold pl-1">/ {currentItem.volumes !== 'N/A' && currentItem.volumes ? currentItem.volumes : '??'}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                                <label className="text-gray-400 font-bold text-right pr-3">Episodes Watched</label>
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="number" 
                                        min="0" 
                                        max={currentItem.episodes !== 'N/A' && currentItem.episodes ? currentItem.episodes : 999}
                                        value={progress} 
                                        onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                                        className="w-16 bg-[#242424] border border-[#3c3c3c] text-white text-xs rounded py-1 px-2 text-center focus:outline-none focus:border-[#4f84c4]"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setProgress(prev => prev + 1)}
                                        className="w-6 h-6 flex items-center justify-center bg-[#333] hover:bg-[#444] rounded text-white font-bold cursor-pointer"
                                    >
                                        +
                                    </button>
                                    <span className="text-gray-400 font-bold pl-1">/ {currentItem.episodes !== 'N/A' && currentItem.episodes ? currentItem.episodes : '12'}</span>
                                    <span className="text-[#4f84c4] hover:underline cursor-pointer pl-2">History</span>
                                </div>
                            </div>
                        )}

                        {/* Score Select */}
                        <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                            <label className="text-gray-400 font-bold text-right pr-3">Your Score</label>
                            <div>
                                {authType === 'mal' ? (
                                    <select 
                                        value={score} 
                                        onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                                        className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-2 py-1.5 cursor-pointer outline-none focus:border-[#4f84c4] min-w-[150px]"
                                    >
                                        <option value="0">Select score</option>
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
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={() => window.location.href = 'api/auth.php?action=login'}
                                        className="py-1.5 px-3 bg-[#242424] hover:bg-[#2c2c2c] border border-[#3c3c3c] hover:border-blue-500/50 text-[#4f84c4] text-xs font-bold rounded flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-center outline-none"
                                    >
                                        <span>Continue with MAL</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                            <label className="text-gray-400 font-bold text-right pr-3">Start Date</label>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-400">Month:</span>
                                <select 
                                    value={startMonth} 
                                    onChange={(e) => setStartMonth(e.target.value)}
                                    className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-1.5 py-1 cursor-pointer outline-none"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <span className="text-gray-400">Day:</span>
                                <select 
                                    value={startDay} 
                                    onChange={(e) => setStartDay(e.target.value)}
                                    className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-1.5 py-1 cursor-pointer outline-none"
                                >
                                    <option value="">Day</option>
                                    {days.slice(1).map(d => (
                                        <option key={d} value={d}>{parseInt(d)}</option>
                                    ))}
                                </select>
                                <span className="text-gray-400">Year:</span>
                                <select 
                                    value={startYear} 
                                    onChange={(e) => setStartYear(e.target.value)}
                                    className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-1.5 py-1 cursor-pointer outline-none"
                                >
                                    <option value="">Year</option>
                                    {years.slice(1).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>

                                <label className="flex items-center space-x-1 pl-2 text-gray-300 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isStartToday}
                                        onChange={(e) => e.target.checked ? handleInsertToday('start') : handleClearDate('start')}
                                        className="rounded border-[#3c3c3c] bg-[#242424] text-animePurple focus:ring-0" 
                                    />
                                    <span className="text-[11px]">Insert Today</span>
                                </label>

                                <label className="flex items-center space-x-1 pl-1 text-gray-300 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isStartUnknown}
                                        onChange={(e) => e.target.checked ? handleClearDate('start') : handleInsertToday('start')}
                                        className="rounded border-[#3c3c3c] bg-[#242424] text-animePurple focus:ring-0" 
                                    />
                                    <span className="text-[11px]">Unknown Date</span>
                                </label>
                            </div>
                        </div>

                        {/* Finish Date */}
                        <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                            <label className="text-gray-400 font-bold text-right pr-3">Finish Date</label>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-gray-400">Month:</span>
                                <select 
                                    value={finishMonth} 
                                    onChange={(e) => setFinishMonth(e.target.value)}
                                    className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-1.5 py-1 cursor-pointer outline-none"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                                <span className="text-gray-400">Day:</span>
                                <select 
                                    value={finishDay} 
                                    onChange={(e) => setFinishDay(e.target.value)}
                                    className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-1.5 py-1 cursor-pointer outline-none"
                                >
                                    <option value="">Day</option>
                                    {days.slice(1).map(d => (
                                        <option key={d} value={d}>{parseInt(d)}</option>
                                    ))}
                                </select>
                                <span className="text-gray-400">Year:</span>
                                <select 
                                    value={finishYear} 
                                    onChange={(e) => setFinishYear(e.target.value)}
                                    className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-1.5 py-1 cursor-pointer outline-none"
                                >
                                    <option value="">Year</option>
                                    {years.slice(1).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>

                                <label className="flex items-center space-x-1 pl-2 text-gray-300 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isFinishToday}
                                        onChange={(e) => e.target.checked ? handleInsertToday('finish') : handleClearDate('finish')}
                                        className="rounded border-[#3c3c3c] bg-[#242424] text-animePurple focus:ring-0" 
                                    />
                                    <span className="text-[11px]">Insert Today</span>
                                </label>

                                <label className="flex items-center space-x-1 pl-1 text-gray-300 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isFinishUnknown}
                                        onChange={(e) => e.target.checked ? handleClearDate('finish') : handleInsertToday('finish')}
                                        className="rounded border-[#3c3c3c] bg-[#242424] text-animePurple focus:ring-0" 
                                    />
                                    <span className="text-[11px]">Unknown Date</span>
                                </label>
                            </div>
                        </div>

                        {/* Collapsible Show Advanced */}
                        <div className="border-t border-[#2b2b2b] pt-3">
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="w-full flex items-center justify-center space-x-1 py-1.5 text-gray-400 hover:text-white cursor-pointer font-bold transition-all text-center"
                            >
                                <span>{showAdvanced ? "Hide Advanced" : "Show Advanced"}</span>
                                <svg className={`w-3.5 h-3.5 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path></svg>
                            </button>

                            {showAdvanced && (
                                <div className="mt-3 space-y-4 border-t border-[#2b2b2b]/40 pt-4">
                                    {/* Rewatched/Reread Times */}
                                    <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                                        <label className="text-gray-400 font-bold text-right pr-3">
                                            {item.type === "manga" ? "Times Reread" : "Times Rewatched"}
                                        </label>
                                        <div>
                                            <input 
                                                type="number" 
                                                min="0"
                                                value={rewatchedTimes} 
                                                onChange={(e) => setRewatchedTimes(parseInt(e.target.value) || 0)}
                                                className="w-20 bg-[#242424] border border-[#3c3c3c] text-white text-xs rounded py-1 px-2 text-center focus:outline-none focus:border-[#4f84c4]"
                                            />
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                                        <label className="text-gray-400 font-bold text-right pr-3">Priority</label>
                                        <div>
                                            <select 
                                                value={priority} 
                                                onChange={(e) => setPriority(e.target.value)}
                                                className="bg-[#242424] border border-[#3c3c3c] text-gray-200 text-xs rounded px-2 py-1.5 cursor-pointer outline-none focus:border-[#4f84c4] min-w-[150px]"
                                            >
                                                <option value="0">Low</option>
                                                <option value="1">Medium</option>
                                                <option value="2">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    <div className="grid grid-cols-[130px_1fr] gap-3 items-start">
                                        <label className="text-gray-400 font-bold text-right pr-3 pt-1">Comments</label>
                                        <div>
                                            <textarea 
                                                value={comments} 
                                                rows="3"
                                                placeholder="Write your thoughts..."
                                                onChange={(e) => setComments(e.target.value)}
                                                className="w-full bg-[#242424] border border-[#3c3c3c] text-white text-xs rounded py-1.5 px-3 focus:outline-none focus:border-[#4f84c4] placeholder-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="grid grid-cols-[130px_1fr] gap-3 items-center">
                                        <label className="text-gray-400 font-bold text-right pr-3">Tags</label>
                                        <div>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. action, romance (comma separated)"
                                                value={tags} 
                                                onChange={(e) => setTags(e.target.value)}
                                                className="w-full bg-[#242424] border border-[#3c3c3c] text-white text-xs rounded py-1.5 px-3 focus:outline-none focus:border-[#4f84c4] placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit / Delete Buttons */}
                        <div className="pt-4 flex items-center justify-center space-x-3 border-t border-[#2b2b2b] select-none">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-1.5 bg-[#2b5998] hover:bg-[#346db7] text-white font-medium text-xs rounded border border-[#1b3a63] cursor-pointer disabled:opacity-50 min-w-[80px]"
                            >
                                {isSaving ? "Saving..." : "Submit"}
                            </button>
                            {isBookmarked && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isSaving}
                                    className="px-6 py-1.5 bg-[#ab2b2b] hover:bg-[#cc3333] text-white font-medium text-xs rounded border border-[#6b1b1b] cursor-pointer disabled:opacity-50 min-w-[80px]"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
