/**
 * Anilogue API Client Service
 * Coordinates frontend requests with the local PHP MyAnimeList API v2 Proxy
 */

const PROXY_URL = 'api/anime.php';

/**
 * Helper to process response and handle unconfigured API credential states
 */
async function fetchFromProxy(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response error: ${response.status}`);
        }
        const data = await response.json();
        
        // Handle unconfigured API state
        if (data && data.status === 'unconfigured') {
            return {
                isUnconfigured: true,
                message: data.message
            };
        }
        
        if (data && data.error) {
            throw new Error(data.error);
        }
        
        return data;
    } catch (error) {
        console.error('API Service Error:', error);
        throw error;
    }
}

/**
 * Fetch top anime rankings (e.g. 'all', 'airing', 'movie')
 */
async function getAnimeRanking(type = 'all') {
    return await fetchFromProxy(`${PROXY_URL}?action=ranking&type=${type}`);
}

/**
 * Fetch dynamic suggestions based on MAL suggestions algorithm
 */
async function getAnimeSuggestions() {
    return await fetchFromProxy(`${PROXY_URL}?action=suggestions`);
}

/**
 * Fetch anime by season and year (e.g. 2026 fall)
 */
async function getAnimeSeason(year, season) {
    return await fetchFromProxy(`${PROXY_URL}?action=season&year=${year}&season=${season}`);
}

/**
 * Search anime from MAL based on text query
 */
async function searchAnime(query) {
    if (!query || query.trim() === '') return [];
    return await fetchFromProxy(`${PROXY_URL}?action=search&q=${encodeURIComponent(query)}`);
}

/**
 * Fetch extended metadata detail for a specific anime
 */
async function getAnimeDetails(id) {
    if (!id) throw new Error('Anime ID is required.');
    return await fetchFromProxy(`${PROXY_URL}?action=detail&id=${id}`);
}

/**
 * Fetch anime list filtered by genre tags
 */
async function getAnimeByGenre(genreName) {
    return await fetchFromProxy(`${PROXY_URL}?action=genre&name=${encodeURIComponent(genreName)}`);
}

// Expose to window scope for other Babel components
window.apiService = {
    getAnimeRanking,
    getAnimeSuggestions,
    getAnimeSeason,
    searchAnime,
    getAnimeDetails,
    getAnimeByGenre
};
