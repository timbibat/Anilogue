<?php
/**
 * Anilogue - Dedicated Anime Profile Webpage
 */
require_once 'config.php';

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$type = isset($_GET['type']) ? $_GET['type'] : 'anime';
$from = isset($_GET['from']) ? $_GET['from'] : '';

// SEO Dynamic Configuration
$seo_title = "ANILOGUE | Watch Premium Anime Online";
$seo_description = "Stream the latest anime releases straight from Japan. High-speed streaming, dark-mode premium player, same-day releases, and popular hits.";
$seo_keywords = "anime, streaming, watch anime, subbed, dubbed, myanimelist, live anime, anilogue, premium anime";
$seo_image = "https://anilogue.free.nf/images/favicon.png";
$seo_url = "https://anilogue.free.nf/details?id=" . $id . "&type=" . $type;

if ($id > 0) {
    // Fetch data from MyAnimeList API to populate real SEO metadata server-side
    $apiUrl = MAL_API_URL . '/' . ($type === 'manga' ? 'manga' : 'anime') . '/' . $id . '?fields=title,main_picture,synopsis,genres';
    
    // Call MyAnimeList API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [];
    if (isset($_SESSION['mal_access_token'])) {
        $headers[] = 'Authorization: Bearer ' . $_SESSION['mal_access_token'];
    } else {
        $token = trim(MAL_CLIENT_ID);
        if (strlen($token) <= 45) {
            $headers[] = 'X-MAL-CLIENT-ID: ' . $token;
        } else {
            if (strpos(strtolower($token), 'bearer ') === 0) {
                $token = substr($token, 7);
            }
            $headers[] = 'Authorization: Bearer ' . $token;
        }
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 4); // Quick timeout to ensure page load is fast
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if ($data && isset($data['title'])) {
            $title = $data['title'];
            $seo_title = htmlspecialchars($title) . " | Watch Online on ANILOGUE";
            
            if (isset($data['synopsis']) && !empty($data['synopsis'])) {
                $synopsis = strip_tags($data['synopsis']);
                if (strlen($synopsis) > 170) {
                    $synopsis = substr($synopsis, 0, 167) . '...';
                }
                $seo_description = htmlspecialchars($synopsis);
            }
            
            if (isset($data['genres']) && is_array($data['genres'])) {
                $genreNames = [];
                foreach ($data['genres'] as $g) {
                    $genreNames[] = strtolower($g['name']);
                }
                if (!empty($genreNames)) {
                    $seo_keywords = htmlspecialchars(implode(', ', $genreNames)) . ", anime, streaming, watch, anilogue";
                }
            }
            
            if (isset($data['main_picture'])) {
                $seo_image = isset($data['main_picture']['large']) ? $data['main_picture']['large'] : $data['main_picture']['medium'];
            }
        }
    }
}

include 'includes/header.php';
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
                        window.location.href = './?tab=' + tab;
                    }} 
                    searchQuery=""
                    setSearchQuery={(query) => {
                        if (query.trim() !== "") {
                            window.location.href = './?q=' + encodeURIComponent(query);
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
                            window.location.href = './?tab=' + (fromTab || (mediaType === 'manga' ? 'manga' : 'home'));
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
