const { useState, useEffect } = React;
const apiService = window.apiService;
const Navbar = window.Navbar;
const HeroBanner = window.HeroBanner;
const AnimeSliderRow = window.AnimeSliderRow;
const CategoryTabCatalog = window.CategoryTabCatalog;
const DetailPage = window.DetailPage;
const LoginModal = window.LoginModal;
const Footer = window.Footer;
const AnimeCard = window.AnimeCard;

// Global SVGs for Search/Catalog Section
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

window.App = function App() {
    // Navigation & Primary state
    const [activeTab, setActiveTab] = useState("home"); // 'home' | 'anime' | 'movies' | 'mylist'
    const [searchQuery, setSearchQuery] = useState("");

    // Modals & Authentication
    const handleAnimeSelect = (anime) => {
        const type = (anime.type && ['Manga', 'Novel', 'Lightnovel', 'Oneshot', 'Doujin', 'Manhwa', 'Manhua'].includes(anime.type)) || anime.chapters !== undefined ? 'manga' : 'anime';
        window.location.href = `details.php?type=${type}&id=${anime.id}&from=${activeTab}`;
    };
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [selectedWatchlistItem, setSelectedWatchlistItem] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authType, setAuthType] = useState(null); // 'local' | 'mal' | null
    const [username, setUsername] = useState("");
    const [userPicture, setUserPicture] = useState("");

    // Live API Lists state
    const [airingAnime, setAiringAnime] = useState([]);
    const [popularAnime, setPopularAnime] = useState([]);
    const [popularManga, setPopularManga] = useState([]);
    const [moviesAnime, setMoviesAnime] = useState([]);
    const [featuredAnime, setFeaturedAnime] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // Loading & API Configuration States
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [apiUnconfigured, setApiUnconfigured] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    // Watchlist Bookmarks (per-account from database, empty until auth check)
    const [myList, setMyList] = useState([]);
    const [myMangaList, setMyMangaList] = useState([]);

    // Bookmarked detailed objects loaded from API as needed
    const [myListDetails, setMyListDetails] = useState([]);
    const [mylistLoading, setMylistLoading] = useState(false);
    const [myMangaListDetails, setMyMangaListDetails] = useState([]);
    const [mymangaListLoading, setMymangaListLoading] = useState(false);
    const [mylistSubTab, setMylistSubTab] = useState("anime"); // 'anime' | 'manga'

    // Helper: Load watchlist IDs from the database for the current local user
    const loadWatchlistFromDB = async () => {
        try {
            const dbData = await apiService.getDBWatchlist();
            if (dbData && dbData.success && dbData.watchlist) {
                const animeIds = dbData.watchlist
                    .filter(item => item.media_type === 'anime')
                    .map(item => parseInt(item.media_id));
                const mangaIds = dbData.watchlist
                    .filter(item => item.media_type === 'manga')
                    .map(item => parseInt(item.media_id));
                setMyList(animeIds);
                setMyMangaList(mangaIds);
            }
        } catch (e) {
            console.error("Failed to load watchlist from DB:", e);
        }
    };

    // Load guest watchlist from localStorage on mount/auth-check if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            const savedList = localStorage.getItem("guestWatchlist");
            const savedMangaList = localStorage.getItem("guestMangaWatchlist");
            if (savedList) {
                try {
                    setMyList(JSON.parse(savedList));
                } catch (e) {
                    console.error("Failed to parse guest watchlist:", e);
                }
            }
            if (savedMangaList) {
                try {
                    setMyMangaList(JSON.parse(savedMangaList));
                } catch (e) {
                    console.error("Failed to parse guest manga watchlist:", e);
                }
            }
        }
    }, [isLoggedIn]);

    // Save guest watchlist to localStorage when myList/myMangaList changes if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            localStorage.setItem("guestWatchlist", JSON.stringify(myList));
            localStorage.setItem("guestMangaWatchlist", JSON.stringify(myMangaList));
        }
    }, [myList, myMangaList, isLoggedIn]);

    // Fetch watchlist details dynamically when myList changes or tab changes to mylist
    useEffect(() => {
        if (activeTab !== "mylist" || myList.length === 0) return;

        let isMounted = true;
        async function fetchWatchlist() {
            setMylistLoading(true);
            try {
                const details = [];
                for (const id of myList) {
                    try {
                        const item = await apiService.getAnimeDetails(id);
                        if (item && !item.isUnconfigured) {
                            details.push(item);
                        }
                    } catch (e) {
                        console.error(`Error loading detail for bookmark ${id}:`, e);
                    }
                }
                if (isMounted) {
                    setMyListDetails(details);
                }
            } catch (err) {
                console.error("Error updating watchlist:", err);
            } finally {
                if (isMounted) {
                    setMylistLoading(false);
                }
            }
        }

        fetchWatchlist();
        return () => { isMounted = false; };
    }, [myList, activeTab]);

    // Fetch manga watchlist details dynamically when myMangaList changes or tab changes to mylist
    useEffect(() => {
        if (activeTab !== "mylist" || myMangaList.length === 0) return;

        let isMounted = true;
        async function fetchMangaWatchlist() {
            setMymangaListLoading(true);
            try {
                const details = [];
                for (const id of myMangaList) {
                    try {
                        const item = await apiService.getMangaDetails(id);
                        if (item && !item.isUnconfigured) {
                            details.push(item);
                        }
                    } catch (e) {
                        console.error(`Error loading detail for manga bookmark ${id}:`, e);
                    }
                }
                if (isMounted) {
                    setMyMangaListDetails(details);
                }
            } catch (err) {
                console.error("Error updating manga watchlist:", err);
            } finally {
                if (isMounted) {
                    setMymangaListLoading(false);
                }
            }
        }

        fetchMangaWatchlist();
        return () => { isMounted = false; };
    }, [myMangaList, activeTab]);

    // Fetch initial homepage categories
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlTab = params.get("tab");
        const urlQuery = params.get("q");
        if (urlTab) {
            setActiveTab(urlTab);
        }
        if (urlQuery) {
            setSearchQuery(decodeURIComponent(urlQuery));
        }

        let isMounted = true;

        // Check local database session first, then fall back to MAL OAuth
        async function checkUserAuth() {
            try {
                // Check local DB session
                const localSession = await apiService.getLocalUserSession();
                if (isMounted && localSession && localSession.isLoggedIn) {
                    if (localSession.authType === 'local') {
                        setIsLoggedIn(true);
                        setAuthType('local');
                        setUsername(localSession.user.username);
                        setUserPicture("");
                        // Load this user's watchlist from the database
                        await loadWatchlistFromDB();
                        return; // Local user found, no need to check MAL
                    }
                }
                // Fall back to MAL OAuth session
                const malUser = await apiService.getCurrentUser();
                if (isMounted && malUser && malUser.isLoggedIn) {
                    setIsLoggedIn(true);
                    setAuthType('mal');
                    setUsername(malUser.username);
                    setUserPicture(malUser.picture || "");
                }
            } catch (err) {
                console.error("Auth verification failed:", err);
            }
        }
        checkUserAuth();

        async function loadHomeData() {
            setInitialLoading(true);
            setNetworkError(false);
            try {
                // Fetch rankings and suggestions concurrently
                const [suggestions, popular, movies, topManga] = await Promise.all([
                    apiService.getAnimeRanking("airing"),
                    apiService.getAnimeRanking("all"),
                    apiService.getAnimeRanking("movie"),
                    apiService.getMangaRanking("all")
                ]);

                if (isMounted) {
                    // Check if proxy reported unconfigured credentials
                    if ((suggestions && suggestions.isUnconfigured) || (popular && popular.isUnconfigured) || (topManga && topManga.isUnconfigured)) {
                        setApiUnconfigured(true);
                    } else {
                        setAiringAnime(suggestions || []);
                        setPopularAnime(popular || []);
                        setMoviesAnime(movies || []);
                        setPopularManga(topManga || []);

                        // Select top 3 popular anime to showcase in the Hero Banner carousel
                        if (popular && popular.length > 0) {
                            setFeaturedAnime(popular.slice(0, 3));
                        }
                    }
                }
            } catch (err) {
                console.error("Home loading error:", err);
                if (isMounted) {
                    setNetworkError(true);
                }
            } finally {
                if (isMounted) {
                    setInitialLoading(false);
                }
            }
        }

        loadHomeData();
        return () => { isMounted = false; };
    }, []);

    // Sync active tab and search query with the browser address bar dynamically without reloading
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        
        if (activeTab === "home") {
            params.delete("tab");
        } else {
            params.set("tab", activeTab);
        }
        
        if (searchQuery.trim() === "") {
            params.delete("q");
        } else {
            params.set("q", searchQuery);
        }
        
        const newSearch = params.toString();
        const newUrl = window.location.pathname + (newSearch ? "?" + newSearch : "");
        window.history.replaceState(null, "", newUrl);
    }, [activeTab, searchQuery]);



    // Fetch live search queries
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = activeTab === "manga"
                    ? await apiService.searchManga(searchQuery)
                    : await apiService.searchAnime(searchQuery);
                if (results && results.isUnconfigured) {
                    setApiUnconfigured(true);
                } else {
                    setSearchResults(results || []);
                }
            } catch (err) {
                console.error("Search query error:", err);
            } finally {
                setSearchLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, activeTab]);

    // Intercept bookmark toggling on the home page to show the options modal
    const toggleBookmark = (id, itemType = 'anime') => {
        setSelectedWatchlistItem({ id, type: itemType });
    };

    // Callback when options are successfully saved/removed in WatchlistOptionsModal
    const handleWatchlistSaveSuccess = async () => {
        if (isLoggedIn) {
            if (authType === 'local') {
                await loadWatchlistFromDB();
            } else {
                window.location.reload();
            }
        } else {
            // For Guest users, update state directly from localStorage
            const savedList = localStorage.getItem("guestWatchlist");
            const savedMangaList = localStorage.getItem("guestMangaWatchlist");
            if (savedList) {
                try {
                    setMyList(JSON.parse(savedList));
                } catch (e) {
                    console.error("Failed to parse guest watchlist:", e);
                }
            } else {
                setMyList([]);
            }
            if (savedMangaList) {
                try {
                    setMyMangaList(JSON.parse(savedMangaList));
                } catch (e) {
                    console.error("Failed to parse guest manga watchlist:", e);
                }
            } else {
                setMyMangaList([]);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logoutUser();
        } catch (e) {
            console.error("Logout API call failed:", e);
        }
        // Clear all user state including watchlist
        setIsLoggedIn(false);
        setAuthType(null);
        setUsername("");
        setUserPicture("");
        setMyList([]);
        setMyListDetails([]);
        window.location.reload();
    };

    // 1. API Unconfigured Setup Guide Screen (Premium Glassmorphism style)
    if (apiUnconfigured) {
        return (
            <div className="min-h-screen bg-darkBg text-gray-100 flex flex-col justify-between">
                <header className="py-6 border-b border-animePurple/20 bg-darkBg/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-[1400px] mx-auto px-6 text-left">
                        <span className="font-orbitron font-black text-2xl tracking-widest text-white">ANI<span className="text-animePurple">LOGUE</span></span>
                    </div>
                </header>

                <main className="flex-grow flex items-center justify-center p-6 relative">
                    <div className="max-w-xl w-full bg-darkCard/80 border-2 border-animePurple rounded-2xl p-8 sm:p-10 shadow-2xl glass-effect text-center space-y-6 animate-slide-up relative z-10 my-10">
                        <div className="w-16 h-16 rounded-full bg-animePurple/20 border border-animePurple flex items-center justify-center mx-auto text-animePurple animate-pulse shadow-neon-purple shadow-animePurple/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        </div>

                        <div className="space-y-2">
                            <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">PORTAL INITIALIZATION REQUIRED</h2>
                            <p className="text-xs text-gray-400 font-medium">To proceed with live anime synchronizations, you must configure a MyAnimeList API Client Key.</p>
                        </div>

                        <div className="border-t border-b border-animePurple/15 py-4 space-y-4 text-left text-xs text-gray-300 font-medium">
                            <p className="text-animePurple-light font-bold font-orbitron uppercase text-[10px] tracking-widest">SETUP PROCEDURES:</p>
                            <ol className="list-decimal pl-5 space-y-2.5">
                                <li>Log into your account on <a href="https://myanimelist.net" target="_blank" rel="noopener" className="text-animeYellow hover:underline">MyAnimeList.net</a>.</li>
                                <li>Navigate to the developer panel: <a href="https://myanimelist.net/apiconfig" target="_blank" rel="noopener" className="text-animeYellow hover:underline">myanimelist.net/apiconfig</a>.</li>
                                <li>Click <strong>Create Client</strong> and fill in the details (Redirect URI can be <code>http://anilogue.free.nf/index.php</code> or <code>http://localhost/Anime/index.php</code>).</li>
                                <li>Copy the generated <strong>Client ID</strong> (not the Client Secret).</li>
                                <li>Open <code>config.php</code> in your file editor.</li>
                                <li>Insert your key: <code>define('MAL_CLIENT_ID', 'YOUR_KEY_HERE');</code></li>
                            </ol>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron font-black text-xs tracking-widest rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-95 transition-all shadow-neon-purple shadow-animePurple/20 cursor-pointer"
                            >
                                RELOAD SYSTEM
                            </button>
                            <a
                                href="https://myanimelist.net/apiconfig"
                                target="_blank"
                                rel="noopener"
                                className="w-full sm:w-auto px-6 py-3.5 bg-darkBg border border-animePurple/30 text-animePurple-light hover:border-animePurple font-orbitron font-bold text-xs tracking-widest rounded-md text-center cursor-pointer transition-all"
                            >
                                GET CLIENT ID
                            </a>
                        </div>
                    </div>
                </main>

                <footer className="py-6 border-t border-animePurple/15 text-center text-xs text-gray-600 font-medium">
                    © 2026 ANILOGUE. All rights designated.
                </footer>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-16 flex flex-col justify-between">

            {/* Header Top Nav */}
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                isLoggedIn={isLoggedIn}
                username={username}
                userPicture={userPicture}
                onLoginClick={() => setShowLoginModal(true)}
                onLogout={handleLogout}
                bookmarkCount={myList.length + myMangaList.length}
            />

            {/* Dynamic Page Views */}
            <main className="flex-grow">
                {searchQuery.trim() !== "" ? (
                    // Live Search Override View
                    <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-16 min-h-[70vh]">
                        <div className="text-left space-y-6 mb-8 border-b border-animePurple/25 pb-6">
                            <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider flex items-center space-x-2">
                                <span>Search Results</span>
                                <span className="text-animePurple">"{searchQuery}"</span>
                            </h2>
                            <p className="text-xs text-gray-400 font-medium">Matching entries live from MyAnimeList</p>
                        </div>

                        {searchLoading ? (
                            <div className="flex items-center justify-center py-24">
                                <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-2 animate-fade-in">
                                <span className="text-lg font-bold font-orbitron tracking-widest text-animePurple">NO ANIME DETECTED</span>
                                <span className="text-sm">We couldn't find matches for "{searchQuery}". Try different search tags!</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                                {searchResults.map(anime => (
                                    <AnimeCard
                                        key={anime.id}
                                        anime={anime}
                                        onCardClick={handleAnimeSelect}
                                        toggleBookmark={toggleBookmark}
                                        myList={myList}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    // Standard Tab Views
                    <div>
                        {activeTab === "home" && (
                            <>
                                {initialLoading ? (
                                    <div className="flex items-center justify-center min-h-[80vh] flex-col space-y-4">
                                        <div className="w-16 h-16 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                                        <p className="font-orbitron tracking-widest text-animePurple text-lg animate-pulse">ANILOGUE ACTIVATING...</p>
                                    </div>
                                ) : networkError ? (
                                    <div className="min-h-[80vh] flex items-center justify-center flex-col space-y-4 p-4 text-center">
                                        <div className="text-red-500 font-orbitron font-bold text-xl uppercase">CONNECTION INTERRUPTED</div>
                                        <p className="text-gray-400 text-sm max-w-md">The server failed to communicate with the MyAnimeList API. Please check your credentials and internet connection.</p>
                                        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-animePurple rounded text-white font-orbitron font-bold text-xs tracking-wider cursor-pointer">RETRY CONNECTION</button>
                                    </div>
                                ) : (
                                    <>
                                        <HeroBanner
                                            featuredList={featuredAnime}
                                            onCardClick={handleAnimeSelect}
                                            toggleBookmark={toggleBookmark}
                                            myList={myList}
                                        />

                                        {/* Slider Rows */}
                                        <div className="space-y-12 py-10 px-4 md:px-12 relative z-10 -mt-16 md:-mt-24">

                                            <AnimeSliderRow
                                                title="Currently Airing"
                                                subtitle="Top trending simulcasts broadcasting now"
                                                badgeText="LIVE"
                                                animeList={airingAnime}
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={toggleBookmark}
                                                myList={myList}
                                            />

                                            <AnimeSliderRow
                                                title="Top Ranked Anime"
                                                subtitle="Highest rated series of all time"
                                                animeList={popularAnime}
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={toggleBookmark}
                                                myList={myList}
                                            />

                                            <AnimeSliderRow
                                                title="Top Ranked Manga"
                                                subtitle="Highest rated manga of all time"
                                                animeList={popularManga}
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={(id) => toggleBookmark(id, 'manga')}
                                                myList={myList}
                                            />

                                            <CategoryTabCatalog
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={toggleBookmark}
                                                myList={myList}
                                            />

                                            <AnimeSliderRow
                                                title="Cinematic Anime Movies"
                                                subtitle="Breathtaking feature length visuals"
                                                animeList={moviesAnime}
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={toggleBookmark}
                                                myList={myList}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Full Catalog Sections */}
                        {activeTab === "anime" && (
                            <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-16 min-h-[70vh]">
                                <div className="text-left space-y-6 mb-8 border-b border-animePurple/25 pb-6">
                                    <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider neon-text-purple">
                                        All Anime Series
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">Top popular anime series on MyAnimeList</p>
                                </div>

                                {initialLoading ? (
                                    <div className="flex items-center justify-center py-24">
                                        <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                                        {popularAnime.map(anime => (
                                            <AnimeCard
                                                key={anime.id}
                                                anime={anime}
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={toggleBookmark}
                                                myList={myList}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "manga" && (
                            <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-16 min-h-[70vh]">
                                <div className="text-left space-y-6 mb-8 border-b border-animePurple/25 pb-6">
                                    <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider neon-text-purple">
                                        Top Ranked Manga
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">Top popular manga and novels on MyAnimeList</p>
                                </div>

                                {initialLoading ? (
                                    <div className="flex items-center justify-center py-24">
                                        <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                                        {popularManga.map(manga => (
                                            <AnimeCard
                                                key={manga.id}
                                                anime={manga}
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={(id) => toggleBookmark(id, 'manga')}
                                                myList={myList}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "movies" && (
                            <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-16 min-h-[70vh]">
                                <div className="text-left space-y-6 mb-8 border-b border-animePurple/25 pb-6">
                                    <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider neon-text-purple">
                                        Anime Movies Catalog
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">Breathtaking full feature animations</p>
                                </div>

                                {initialLoading ? (
                                    <div className="flex items-center justify-center py-24">
                                        <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                                        {moviesAnime.map(anime => (
                                            <AnimeCard
                                                key={anime.id}
                                                anime={anime}
                                                onCardClick={handleAnimeSelect}
                                                toggleBookmark={toggleBookmark}
                                                myList={myList}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === "mylist" && (
                            <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-16 min-h-[70vh]">
                                <div className="text-left space-y-6 mb-8 border-b border-animePurple/25 pb-6">
                                    <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-wider neon-text-purple">
                                        My List (Bookmarks)
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">Your customized watchlists synced to storage</p>
                                </div>

                                {/* Premium Category Sub-Tabs Selector */}
                                <div className="flex gap-4 border-b border-animePurple/15 mb-8 pb-1 font-orbitron text-xs sm:text-sm font-bold">
                                    <button 
                                        onClick={() => setMylistSubTab("anime")}
                                        className={`pb-3 px-2 uppercase tracking-wider relative cursor-pointer transition-colors flex items-center space-x-2 ${mylistSubTab === 'anime' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <span>Anime Watchlist</span>
                                        <span className="bg-animePurple text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{myList.length}</span>
                                        {mylistSubTab === 'anime' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-animePurple to-transparent"></span>}
                                    </button>
                                    <button 
                                        onClick={() => setMylistSubTab("manga")}
                                        className={`pb-3 px-2 uppercase tracking-wider relative cursor-pointer transition-colors flex items-center space-x-2 ${mylistSubTab === 'manga' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <span>Manga Watchlist</span>
                                        <span className="bg-animePurple text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{myMangaList.length}</span>
                                        {mylistSubTab === 'manga' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-animePurple to-transparent"></span>}
                                    </button>
                                </div>

                                {mylistSubTab === "anime" ? (
                                    myList.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-darkCard flex items-center justify-center border border-animePurple/20 text-animePurple shadow-neon-purple shadow-animePurple/10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-base font-bold font-orbitron tracking-widest text-white block text-center">YOUR ANIME WATCHLIST IS EMPTY</span>
                                                <span className="text-xs block text-center">Explore home page rows, hover posters, and tap '+' to fill your anime bookmarks.</span>
                                            </div>
                                        </div>
                                    ) : mylistLoading ? (
                                        <div className="flex items-center justify-center py-24">
                                            <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 animate-fade-in">
                                            {myListDetails.map(anime => (
                                                <AnimeCard
                                                    key={anime.id}
                                                    anime={anime}
                                                    onCardClick={handleAnimeSelect}
                                                    toggleBookmark={toggleBookmark}
                                                    myList={myList}
                                                />
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    myMangaList.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-darkCard flex items-center justify-center border border-animePurple/20 text-animePurple shadow-neon-purple shadow-animePurple/10">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-base font-bold font-orbitron tracking-widest text-white block text-center">YOUR MANGA WATCHLIST IS EMPTY</span>
                                                <span className="text-xs block text-center">Explore home page rows, hover manga posters, and tap '+' to fill your manga bookmarks.</span>
                                            </div>
                                        </div>
                                    ) : mymangaListLoading ? (
                                        <div className="flex items-center justify-center py-24">
                                            <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 animate-fade-in">
                                            {myMangaListDetails.map(manga => (
                                                <AnimeCard
                                                    key={manga.id}
                                                    anime={manga}
                                                    onCardClick={handleAnimeSelect}
                                                    toggleBookmark={(id) => toggleBookmark(id, 'manga')}
                                                    myList={myMangaList}
                                                />
                                            ))}
                                        </div>
                                    )
                                )}
                            </section>
                        )}
                    </div>
                )}
            </main>

            <Footer />

            {/* Glassmorphic Account Login Modal */}
            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onLoginSuccess={async (user, loginAuthType) => {
                        setIsLoggedIn(true);
                        setAuthType(loginAuthType || 'local');
                        setUsername(user);
                        setUserPicture("");
                        setShowLoginModal(false);
                        // Load this user's saved watchlist from database
                        if (loginAuthType === 'local') {
                            await loadWatchlistFromDB();
                        }
                    }}
                />
            )}
            {selectedWatchlistItem && (
                <WatchlistOptionsModal
                    item={selectedWatchlistItem}
                    isLoggedIn={isLoggedIn}
                    authType={authType}
                    onClose={() => setSelectedWatchlistItem(null)}
                    onSaveSuccess={handleWatchlistSaveSuccess}
                    myList={myList}
                />
            )}
        </div>
    );
}
