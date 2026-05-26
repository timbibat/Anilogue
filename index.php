<?php
/**
 * Anilogue - Modern Anime Streaming Platform
 * Designed for InfinityFree & standard PHP hosting
 * Modular structure with MyAnimeList API v2 active synchronizations
 */
require_once 'config.php';
include 'includes/header.php';
?>

<!-- React Mount Node -->
<div id="root">
    <!-- Premium Loader prior to React Hydration -->
    <div class="flex items-center justify-center min-h-screen flex-col space-y-4">
        <div class="w-16 h-16 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
        <p class="font-orbitron tracking-widest text-animePurple text-lg animate-pulse">ANILOGUE ACTIVATING...</p>
    </div>
</div>

<!-- Load API Client Service First -->
<script type="text/babel" src="js/services/api.js"></script>

<!-- Load Individual UI Leaf Components -->
<script type="text/babel" src="js/components/AnimeCard.js"></script>
<script type="text/babel" src="js/components/Navbar.js"></script>
<script type="text/babel" src="js/components/LoginModal.js"></script>
<script type="text/babel" src="js/components/Footer.js"></script>

<!-- Load Composite Components depending on Leaf Components -->
<script type="text/babel" src="js/components/HeroBanner.js"></script>
<script type="text/babel" src="js/components/AnimeSliderRow.js"></script>
<script type="text/babel" src="js/components/CategoryTabCatalog.js"></script>
<script type="text/babel" src="js/components/DetailPage.js"></script>

<!-- Load Main Orchestrator App Component -->
<script type="text/babel" src="js/app.js"></script>

<!-- Bootstrapper Mounting React App -->
<script type="text/babel">
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
</script>

<?php
include 'includes/footer.php';
?>