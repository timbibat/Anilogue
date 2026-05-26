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
 * Fetch top anime rankings (e.g. 'airing', 'bypopularity', 'movie', 'all')
 */
export async function getAnimeRanking(type = 'airing') {
    return await fetchFromProxy(`${PROXY_URL}?action=ranking&type=${type}`);
}

/**
 * Search anime from MAL based on text query
 */
export async function searchAnime(query) {
    if (!query || query.trim() === '') return [];
    return await fetchFromProxy(`${PROXY_URL}?action=search&q=${encodeURIComponent(query)}`);
}

/**
 * Fetch extended metadata detail for a specific anime
 */
export async function getAnimeDetails(id) {
    if (!id) throw new Error('Anime ID is required.');
    return await fetchFromProxy(`${PROXY_URL}?action=detail&id=${id}`);
}

/**
 * Fetch anime list filtered by genre tags
 */
export async function getAnimeByGenre(genreName) {
    return await fetchFromProxy(`${PROXY_URL}?action=genre&name=${encodeURIComponent(genreName)}`);
}
