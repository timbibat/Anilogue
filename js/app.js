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
        window.location.href = 'details.php?id=' + anime.id;
    };
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");

    // Live API Lists state
    const [airingAnime, setAiringAnime] = useState([]);
    const [popularAnime, setPopularAnime] = useState([]);
    const [moviesAnime, setMoviesAnime] = useState([]);
    const [featuredAnime, setFeaturedAnime] = useState([]);
    const [searchResults, setSearchResults] = useState([]);

    // Loading & API Configuration States
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [apiUnconfigured, setApiUnconfigured] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    // Watchlist Bookmarks (LocalStorage)
    const [myList, setMyList] = useState(() => {
        const saved = localStorage.getItem("anilogue_mylist_live");
        return saved ? JSON.parse(saved) : [];
    });

    // Bookmarked Anime detailed objects loaded from API as needed
    const [myListDetails, setMyListDetails] = useState([]);
    const [mylistLoading, setMylistLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem("anilogue_mylist_live", JSON.stringify(myList));
    }, [myList]);

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
        async function loadHomeData() {
            setInitialLoading(true);
            setNetworkError(false);
            try {
                // Fetch rankings and suggestions concurrently
                const [suggestions, popular, movies] = await Promise.all([
                    apiService.getAnimeRanking("airing"),
                    apiService.getAnimeRanking("all"),
                    apiService.getAnimeRanking("movie")
                ]);

                if (isMounted) {
                    // Check if proxy reported unconfigured credentials
                    if ((suggestions && suggestions.isUnconfigured) || (popular && popular.isUnconfigured)) {
                        setApiUnconfigured(true);
                    } else {
                        setAiringAnime(suggestions || []);
                        setPopularAnime(popular || []);
                        setMoviesAnime(movies || []);
                        
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



    // Fetch live search queries
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await apiService.searchAnime(searchQuery);
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
    }, [searchQuery]);

    // Add or remove bookmark
    const toggleBookmark = (id) => {
        if (myList.includes(id)) {
            setMyList(myList.filter(item => item !== id));
        } else {
            setMyList([...myList, id]);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUsername("");
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
                onLoginClick={() => setShowLoginModal(true)}
                onLogout={handleLogout}
                bookmarkCount={myList.length}
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

                                {myList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-gray-500 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-darkCard flex items-center justify-center border border-animePurple/20 text-animePurple shadow-neon-purple shadow-animePurple/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-base font-bold font-orbitron tracking-widest text-white block">YOUR WATCHLIST IS EMPTY</span>
                                            <span className="text-xs block">Explore home page rows, hover anime posters, and tap '+' to fill your bookmarks list.</span>
                                        </div>
                                    </div>
                                ) : mylistLoading ? (
                                    <div className="flex items-center justify-center py-24">
                                        <div className="w-12 h-12 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
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
                    onLoginSuccess={(user) => {
                        setIsLoggedIn(true);
                        setUsername(user);
                        setShowLoginModal(false);
                    }}
                />
            )}
        </div>
    );
}
