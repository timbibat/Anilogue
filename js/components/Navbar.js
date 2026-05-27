const { useState, useEffect } = React;

// Search Icon Helper
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// Close Icon Helper
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

window.Navbar = function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery, isLoggedIn, username, userPicture, onLoginClick, onLogout, bookmarkCount }) {
    const [scrolled, setScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchQuery || "");

    useEffect(() => {
        setLocalQuery(searchQuery || "");
    }, [searchQuery]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 40) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-darkBg/95 backdrop-blur-md shadow-lg border-animePurple/20 py-3' : 'bg-transparent border-transparent py-5'}`}>
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between">
                
                {/* Brand Logo */}
                <div className="flex items-center space-x-8">
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("home"); setSearchQuery(""); }} className="flex items-center space-x-2 group">
                        <img 
                            src="images/favicon.png" 
                            alt="Anilogue Logo" 
                            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        />
                        <span className="font-orbitron font-black text-2xl tracking-widest text-white group-hover:text-animePurple transition-colors duration-300">ANI<span className="text-animePurple">LOGUE</span></span>
                    </a>
                    <nav className="hidden lg:flex items-center space-x-6 text-sm text-gray-300 font-semibold uppercase">
                        <button 
                            onClick={() => { setActiveTab("anime"); setSearchQuery(""); }}
                            className={`hover:text-white uppercase transition-colors relative py-1 ${activeTab === 'anime' ? 'text-white' : ''}`}
                        >
                            Anime
                            {activeTab === 'anime' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-animePurple to-transparent"></span>}
                        </button>
                        <button 
                            onClick={() => { setActiveTab("manga"); setSearchQuery(""); }}
                            className={`hover:text-white uppercase transition-colors relative py-1 ${activeTab === 'manga' ? 'text-white' : ''}`}
                        >
                            Manga
                            {activeTab === 'manga' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-animePurple to-transparent"></span>}
                        </button>
                        <button 
                            onClick={() => { setActiveTab("movies"); setSearchQuery(""); }}
                            className={`hover:text-white uppercase transition-colors relative py-1 ${activeTab === 'movies' ? 'text-white' : ''}`}
                        >
                            Movies
                            {activeTab === 'movies' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-animePurple to-transparent"></span>}
                        </button>
                        <button 
                            onClick={() => { setActiveTab("mylist"); setSearchQuery(""); }}
                            className={`hover:text-white uppercase transition-colors relative py-1 flex items-center space-x-1.5 ${activeTab === 'mylist' ? 'text-white' : ''}`}
                        >
                            <span>My List</span>
                            {bookmarkCount > 0 && <span className="bg-animePurple text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{bookmarkCount}</span>}
                            {activeTab === 'mylist' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-animePurple to-transparent"></span>}
                        </button>
                    </nav>
                </div>

                {/* Right Area: Search + Bookmarks + Login */}
                <div className="flex items-center space-x-4">
                    
                    {/* Interactive Search Bar */}
                    <div className={`relative flex items-center bg-darkCard/60 rounded-full border border-animePurple/20 px-3.5 py-1.5 transition-all duration-300 ${searchFocused || localQuery ? 'w-44 sm:w-64 border-animePurple shadow-neon-purple/20' : 'w-36 sm:w-48'}`}>
                        <SearchIcon />
                        <input 
                            type="text" 
                            value={localQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setLocalQuery(val);
                                if (!window.location.pathname.includes("details.php")) {
                                    setSearchQuery(val);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setSearchQuery(localQuery);
                                }
                            }}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            placeholder="Search catalog..." 
                            className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 w-full ml-2 focus:ring-0"
                        />
                        {localQuery && (
                            <button onClick={() => { setLocalQuery(""); setSearchQuery(""); }} className="text-gray-400 hover:text-white cursor-pointer ml-1">
                                <CloseIcon />
                            </button>
                        )}
                    </div>

                    {/* Mobile Catalog Tabs navigation shortcuts (Icons for responsiveness) */}
                    <div className="flex lg:hidden items-center space-x-3 text-gray-400">
                        <button onClick={() => { setActiveTab("home"); setSearchQuery(""); }} className={`p-1.5 hover:text-white ${activeTab === "home" ? "text-animePurple" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        </button>
                        <button onClick={() => { setActiveTab("manga"); setSearchQuery(""); }} className={`p-1.5 hover:text-white ${activeTab === "manga" ? "text-animePurple" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        </button>
                        <button onClick={() => { setActiveTab("mylist"); setSearchQuery(""); }} className={`p-1.5 hover:text-white relative ${activeTab === "mylist" ? "text-animePurple" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                            {bookmarkCount > 0 && <span className="absolute -top-1 -right-1 bg-animePurple text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{bookmarkCount}</span>}
                        </button>
                    </div>

                    {/* Profile or Login Trigger */}
                    {isLoggedIn ? (
                        <div className="flex items-center space-x-3 group relative cursor-pointer">
                            <div className="w-9 h-9 rounded-full ring-2 ring-animePurple overflow-hidden">
                                <img src={userPicture || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80"} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="hidden md:flex flex-col text-left">
                                <span className="text-xs font-semibold text-white max-w-[80px] truncate">{username}</span>
                                <button onClick={onLogout} className="text-[10px] text-red-400 font-medium tracking-wider hover:underline hover:text-red-300">LOGOUT</button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={onLoginClick}
                            className="bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron text-xs font-bold tracking-widest px-4 sm:px-5 py-2.5 rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-95 transition-all duration-300 shadow-neon-purple shadow-animePurple/20 flex items-center space-x-1.5"
                        >
                            <span>LOGIN</span>
                        </button>
                    )}

                </div>
            </div>
        </header>
    );
}
