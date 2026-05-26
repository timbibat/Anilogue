<?php
/**
 * Anilogue - Dedicated Anime Profile Webpage
 */
require_once 'config.php';
include 'includes/header.php';
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
?>

<!-- React Mount Node -->
<div id="root" data-anime-id="<?php echo $id; ?>">
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
        const [username, setUsername] = useState("");
        const [myList, setMyList] = useState(() => {
            const saved = localStorage.getItem("anilogue_mylist_live");
            return saved ? JSON.parse(saved) : [];
        });

        useEffect(() => {
            localStorage.setItem("anilogue_mylist_live", JSON.stringify(myList));
        }, [myList]);

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

        const animeId = parseInt(document.getElementById('root').getAttribute('data-anime-id'));

        return (
            <div className="relative min-h-screen pb-16 flex flex-col justify-between">
                <Navbar 
                    activeTab="" 
                    setActiveTab={(tab) => {
                        window.location.href = 'index.php?tab=' + tab;
                    }} 
                    searchQuery=""
                    setSearchQuery={(query) => {
                        if (query.trim() !== "") {
                            window.location.href = 'index.php?q=' + encodeURIComponent(query);
                        }
                    }}
                    isLoggedIn={isLoggedIn}
                    username={username}
                    onLoginClick={() => setShowLoginModal(true)}
                    onLogout={handleLogout}
                    bookmarkCount={myList.length}
                />

                <main className="flex-grow">
                    <DetailPage 
                        anime={{ id: animeId }} 
                        onClose={() => {
                            window.location.href = 'index.php';
                        }}
                        toggleBookmark={toggleBookmark}
                        myList={myList}
                    />
                </main>

                <Footer />

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

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<DetailApp />);
</script>

<?php
include 'includes/footer.php';
?>
