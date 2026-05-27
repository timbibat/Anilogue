<?php
/**
 * Anilogue - Dedicated Anime Profile Webpage
 */
require_once 'config.php';
include 'includes/header.php';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$type = isset($_GET['type']) ? $_GET['type'] : 'anime';
$from = isset($_GET['from']) ? $_GET['from'] : '';
?>

<!-- React Mount Node -->
<div id="root" data-anime-id="<?php echo $id; ?>" data-media-type="<?php echo htmlspecialchars($type); ?>" data-from="<?php echo htmlspecialchars($from); ?>">
    <div class="flex items-center justify-center min-h-screen flex-col space-y-4">
        <div class="w-16 h-16 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
        <p class="font-orbitron tracking-widest text-animePurple text-lg animate-pulse">SYNCHRONIZING PROFILE...</p>
    </div>
</div>

<!-- Load API Client Service First -->
<script type="text/babel" src="js/services/api.js"></script>

<!-- Load Individual UI Leaf Components -->
<script type="text/babel" src="js/components/Navbar.js"></script>
<script type="text/babel" src="js/components/LoginModal.js"></script>
<script type="text/babel" src="js/components/Footer.js"></script>
<script type="text/babel" src="js/components/DetailPage.js"></script>

<!-- Standalone React Detail App Mount -->
<script type="text/babel">
    const { useState, useEffect } = React;
    const apiService = window.apiService;
    const Navbar = window.Navbar;
    const DetailPage = window.DetailPage;
    const LoginModal = window.LoginModal;
    const Footer = window.Footer;

    function DetailApp() {
        const [showLoginModal, setShowLoginModal] = useState(false);
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [authType, setAuthType] = useState(null); // 'local' | 'mal' | null
        const [username, setUsername] = useState("");
        const [userPicture, setUserPicture] = useState("");
        const [myList, setMyList] = useState([]);
        const [myMangaList, setMyMangaList] = useState([]);

        const loadWatchlistFromMAL = async () => {
            try {
                const animeData = await apiService.getMALWatchlist('anime');
                const mangaData = await apiService.getMALWatchlist('manga');
                if (animeData && animeData.success && animeData.watchlist) {
                    setMyList(animeData.watchlist);
                }
                if (mangaData && mangaData.success && mangaData.watchlist) {
                    setMyMangaList(mangaData.watchlist);
                }
            } catch (e) {
                console.error("Failed to load MAL watchlist:", e);
            }
        };

        // Load guest watchlist from localStorage if not logged in
        useEffect(() => {
            if (!isLoggedIn) {
                const savedAnime = localStorage.getItem("guestWatchlist");
                const savedManga = localStorage.getItem("guestMangaWatchlist");
                if (savedAnime) {
                    try { setMyList(JSON.parse(savedAnime)); } catch(e) {}
                }
                if (savedManga) {
                    try { setMyMangaList(JSON.parse(savedManga)); } catch(e) {}
                }
            }
        }, [isLoggedIn]);

        // Save guest watchlist to localStorage when altered if not logged in
        useEffect(() => {
            if (!isLoggedIn) {
                localStorage.setItem("guestWatchlist", JSON.stringify(myList));
                localStorage.setItem("guestMangaWatchlist", JSON.stringify(myMangaList));
            }
        }, [myList, myMangaList, isLoggedIn]);

        // Check active MyAnimeList user session
        useEffect(() => {
            let isMounted = true;
            async function checkUserAuth() {
                try {
                    const malUser = await apiService.getCurrentUser();
                    if (isMounted && malUser && malUser.isLoggedIn) {
                        setIsLoggedIn(true);
                        setAuthType('mal');
                        setUsername(malUser.username);
                        setUserPicture(malUser.picture || "");
                        
                        // Load live watchlist from MyAnimeList
                        await loadWatchlistFromMAL();
                    }
                } catch (err) {
                    console.error("Auth verification failed:", err);
                }
            }
            checkUserAuth();
            return () => { isMounted = false; };
        }, []);

        const animeId = parseInt(document.getElementById('root').getAttribute('data-anime-id'));
        const mediaType = document.getElementById('root').getAttribute('data-media-type') || 'anime';
        const fromTab = document.getElementById('root').getAttribute('data-from') || '';

        const toggleBookmark = async (id, itemType = mediaType) => {
            if (itemType === 'manga') {
                if (myMangaList.includes(id)) {
                    setMyMangaList(myMangaList.filter(item => item !== id));
                    if (isLoggedIn && authType === 'mal') {
                        try { await apiService.deleteMALListItem(id, 'manga'); } catch (e) { console.error("MAL unsync failed:", e); }
                    }
                } else {
                    setMyMangaList([...myMangaList, id]);
                    if (isLoggedIn && authType === 'mal') {
                        try { await apiService.updateMALListStatus(id, 'plan_to_watch', 'manga'); } catch (e) { console.error("MAL sync failed:", e); }
                    }
                }
            } else {
                if (myList.includes(id)) {
                    setMyList(myList.filter(item => item !== id));
                    if (isLoggedIn && authType === 'mal') {
                        try { await apiService.deleteMALListItem(id, 'anime'); } catch (e) { console.error("MAL unsync failed:", e); }
                    }
                } else {
                    setMyList([...myList, id]);
                    if (isLoggedIn && authType === 'mal') {
                        try { await apiService.updateMALListStatus(id, 'plan_to_watch', 'anime'); } catch (e) { console.error("MAL sync failed:", e); }
                    }
                }
            }
        };

        const handleLogout = async () => {
            try {
                await apiService.logoutUser();
            } catch (e) {
                console.error("Logout failed:", e);
            }
            setIsLoggedIn(false);
            setAuthType(null);
            setUsername("");
            setUserPicture("");
            setMyList([]);
            setMyMangaList([]);
            window.location.reload();
        };

        return (
            <div className="relative min-h-screen pb-16 flex flex-col justify-between">
                <Navbar 
                    activeTab="" 
                    setActiveTab={(tab) => {
                        window.location.href = './index.php?tab=' + tab;
                    }} 
                    searchQuery=""
                    setSearchQuery={(query) => {
                        if (query.trim() !== "") {
                            window.location.href = './index.php?q=' + encodeURIComponent(query);
                        }
                    }}
                    isLoggedIn={isLoggedIn}
                    username={username}
                    userPicture={userPicture}
                    onLoginClick={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    bookmarkCount={myList.length + myMangaList.length}
                />

                <main className="flex-grow">
                    <DetailPage 
                        anime={{ id: animeId }} 
                        type={mediaType}
                        isLoggedIn={isLoggedIn}
                        authType={authType}
                        onClose={() => {
                            window.location.href = './index.php?tab=' + (fromTab || (mediaType === 'manga' ? 'manga' : 'home'));
                        }}
                        toggleBookmark={toggleBookmark}
                        myList={mediaType === 'manga' ? myMangaList : myList}
                    />
                </main>

                <Footer />

                {showLoginModal && (
                    <LoginModal 
                        onClose={() => setShowLoginModal(false)}
                        onLoginSuccess={async (user, loginAuthType) => {
                            setIsLoggedIn(true);
                            setAuthType(loginAuthType || 'mal');
                            setUsername(user);
                            setUserPicture("");
                            setShowLoginModal(false);
                        }}
                    />
                )}
            </div>
        );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<DetailApp />);
</script>

<?php
include 'includes/footer.php';
?>
