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

<!-- Main React Orchestrator Bootstrapper -->
<script type="text/babel" data-type="module">
    import App from './js/app.js';
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
</script>

<?php
include 'includes/footer.php';
?>
