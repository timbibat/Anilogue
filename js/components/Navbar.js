const { useState, useEffect } = React;

// Search Icon Helper
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// Close Icon Helper
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

// Hamburger Icon Helper
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

window.Navbar = function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery, isLoggedIn, username, userPicture, onLoginClick, onLogout, bookmarkCount }) {
    const [scrolled, setScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchQuery || "");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    // Prevent body scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [mobileMenuOpen]);

    const handleMobileTabClick = (tab) => {
        setActiveTab(tab);
        setSearchQuery("");
        setMobileMenuOpen(false);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-darkBg/95 backdrop-blur-md shadow-lg border-animePurple/20 py-3.5' : 'bg-transparent border-transparent py-5'}`}>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
                
                {/* Brand Logo */}
                <div className="flex items-center space-x-8">
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("home"); setSearchQuery(""); setMobileMenuOpen(false); }} className="flex items-center space-x-1.5 sm:space-x-2 group">
                        <img 
                            src="images/favicon.png" 
                            alt="Anilogue Logo" 
                            className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                        />
                        <span className="font-orbitron font-black text-lg sm:text-2xl tracking-widest text-white group-hover:text-animePurple transition-colors duration-300">ANI<span className="text-animePurple">LOGUE</span></span>
                    </a>
                    
                    {/* Desktop Navigation */}
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

                {/* Right Area: Search + Mobile Menu Toggle / Desktop User Actions */}
                <div className="flex items-center space-x-2.5 sm:space-x-4">
                    
                    {/* Interactive Search Bar (Responsive sizing to avoid clashing) */}
                    <div className={`relative flex items-center bg-darkCard/60 rounded-full border border-animePurple/20 px-3 py-1.5 transition-all duration-300 ${searchFocused || localQuery ? 'w-32 xs:w-44 sm:w-56 md:w-64 border-animePurple shadow-neon-purple/20' : 'w-24 xs:w-32 sm:w-44'}`}>
                        <SearchIcon />
                        <input 
                            type="text" 
                            value={localQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setLocalQuery(val);
                                if (!window.location.pathname.includes("details")) {
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
                            placeholder="Search..." 
                            className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 w-full ml-1.5 sm:ml-2 focus:ring-0 focus:border-none p-0"
                        />
                        {localQuery && (
                            <button onClick={() => { setLocalQuery(""); setSearchQuery(""); }} className="text-gray-400 hover:text-white cursor-pointer ml-1">
                                <CloseIcon />
                            </button>
                        )}
                    </div>

                    {/* Desktop User actions */}
                    <div className="hidden lg:flex items-center">
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-3 group relative cursor-pointer">
                                <div className="w-9 h-9 rounded-full ring-2 ring-animePurple overflow-hidden">
                                    <img src={userPicture || "images/default-avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-xs font-semibold text-white max-w-[80px] truncate">{username}</span>
                                    <button onClick={onLogout} className="text-[10px] text-red-400 font-medium tracking-wider hover:underline hover:text-red-300">LOGOUT</button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={onLoginClick}
                                className="bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron text-xs font-bold tracking-widest px-5 py-2.5 rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-95 transition-all duration-300 shadow-neon-purple shadow-animePurple/20 flex items-center space-x-1.5"
                            >
                                <span>LOGIN</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Hamburger Menu Toggle Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg bg-darkCard/80 border border-animePurple/30 text-gray-300 hover:text-white transition-all duration-150 cursor-pointer flex items-center justify-center hover:bg-darkCard/95 hover:border-animePurple shadow-lg hover:shadow-animePurple/10"
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>

                </div>
            </div>
        </header>

        {/* Premium, Glowing Full-Width Glassmorphic Mobile Menu Drawer */}
        <div 
            className={`fixed inset-0 top-[60px] sm:top-[76px] z-[9999] bg-[#06010d]/96 border-t border-animePurple/20 transition-all duration-500 lg:hidden flex flex-col justify-between ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}
            style={{
                WebkitBackdropFilter: 'blur(24px)',
                backdropFilter: 'blur(24px)'
            }}
        >
            {/* Drawer Links */}
            <div className="flex-grow flex flex-col p-8 space-y-6 text-left select-none overflow-y-auto">
                <span className="font-orbitron text-[10px] font-bold text-animePurple-light tracking-widest uppercase border-b border-animePurple/15 pb-2">Browse Catalog</span>
                
                <button 
                    onClick={() => handleMobileTabClick("home")}
                    className={`text-xl font-orbitron font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between ${activeTab === 'home' ? 'text-animePurple' : 'text-gray-300 hover:text-white'}`}
                >
                    <span>Home Portal</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button 
                    onClick={() => handleMobileTabClick("anime")}
                    className={`text-xl font-orbitron font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between ${activeTab === 'anime' ? 'text-animePurple' : 'text-gray-300 hover:text-white'}`}
                >
                    <span>Anime Catalog</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button 
                    onClick={() => handleMobileTabClick("manga")}
                    className={`text-xl font-orbitron font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between ${activeTab === 'manga' ? 'text-animePurple' : 'text-gray-300 hover:text-white'}`}
                >
                    <span>Manga Catalog</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button 
                    onClick={() => handleMobileTabClick("movies")}
                    className={`text-xl font-orbitron font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between ${activeTab === 'movies' ? 'text-animePurple' : 'text-gray-300 hover:text-white'}`}
                >
                    <span>Movies</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>

                <button 
                    onClick={() => handleMobileTabClick("mylist")}
                    className={`text-xl font-orbitron font-bold uppercase tracking-wider text-left transition-colors flex items-center justify-between ${activeTab === 'mylist' ? 'text-animePurple' : 'text-gray-300 hover:text-white'}`}
                >
                    <div className="flex items-center space-x-3">
                        <span>My Watchlist</span>
                        {bookmarkCount > 0 && <span className="bg-animePurple text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-md shadow-animePurple/20">{bookmarkCount}</span>}
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>

            {/* Mobile Drawer Account Footer area */}
            <div className="p-8 bg-darkCard/30 border-t border-animePurple/15 text-left">
                {isLoggedIn ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-11 h-11 rounded-full ring-2 ring-animePurple overflow-hidden">
                                <img src={userPicture || "images/default-avatar.png"} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Account Connected</span>
                                <span className="text-sm font-bold text-white max-w-[150px] truncate">{username}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                            className="px-4 py-2 border border-red-500/30 text-red-400 hover:text-white hover:bg-red-600 hover:border-red-600 rounded font-orbitron font-bold text-xs tracking-wider transition-all"
                        >
                            LOGOUT
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">Sync watchlists, ratings, scores, and episode progress across multiple devices securely.</p>
                        <button 
                            onClick={() => { onLoginClick(); setMobileMenuOpen(false); }}
                            className="w-full py-3 bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron font-black text-xs tracking-widest rounded-md flex items-center justify-center space-x-1.5 shadow-neon-purple shadow-animePurple/25"
                        >
                            <span>SIGN IN / SYNC MYLIST</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </>
);
}
