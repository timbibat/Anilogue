/**
 * Anilogue API Client Service
 * Coordinates frontend requests with the local PHP MyAnimeList API v2 Proxy
 */

const PROXY_URL = 'api/anime.php';
const MANGA_PROXY_URL = 'api/manga.php';

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

/**
 * Fetch logged in official MyAnimeList user profile
 */
async function getCurrentUser() {
    return await fetchFromProxy(`${PROXY_URL}?action=me`);
}

/**
 * Update official user watchlist status on MAL live
 */
async function updateMALListStatus(id, status = 'plan_to_watch', type = 'anime', extraFields = {}) {
    try {
        const proxy = type === 'manga' ? MANGA_PROXY_URL : PROXY_URL;
        let body = `id=${id}&status=${status}`;
        for (const [key, val] of Object.entries(extraFields)) {
            if (val !== undefined && val !== null && val !== '') {
                body += `&${key}=${encodeURIComponent(val)}`;
            }
        }
        const response = await fetch(`${proxy}?action=update_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });
        if (!response.ok) {
            throw new Error(`HTTP status error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to update MAL status:', error);
        throw error;
    }
}

/**
 * Delete an item from the official MyAnimeList watchlist entirely
 */
async function deleteMALListItem(id, type = 'anime') {
    try {
        const proxy = type === 'manga' ? MANGA_PROXY_URL : PROXY_URL;
        const response = await fetch(`${proxy}?action=delete_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id=${id}`
        });
        if (!response.ok) {
            throw new Error(`HTTP status error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to delete MAL status:', error);
        throw error;
    }
}

// Expose to window scope for other Babel components
window.apiService = {
    getAnimeRanking,
    getAnimeSuggestions,
    getAnimeSeason,
    searchAnime,
    getAnimeDetails,
    getAnimeByGenre,
    getCurrentUser,
    updateMALListStatus,
    deleteMALListItem,
    
    // Manga API Section
    searchManga: async function(query) {
        if (!query || query.trim() === '') return [];
        return await fetchFromProxy(`${MANGA_PROXY_URL}?action=manga_search&q=${encodeURIComponent(query)}`);
    },
    getMangaRanking: async function(type = 'all') {
        return await fetchFromProxy(`${MANGA_PROXY_URL}?action=manga_ranking&type=${type}`);
    },
    getMangaDetails: async function(id) {
        if (!id) throw new Error('Manga ID is required.');
        return await fetchFromProxy(`${MANGA_PROXY_URL}?action=manga_detail&id=${id}`);
    },

    // ═══════════════════════════════════════════
    // Local Account Auth API Section
    // ═══════════════════════════════════════════

    /** Register a new local user account */
    registerLocalUser: async function(username, email, password) {
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ username, email, password })
        });
        return await response.json();
    },

    /** Login with local database credentials */
    loginLocalUser: async function(username, password) {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    },

    /** Check current user session (local or MAL) */
    getLocalUserSession: async function() {
        try {
            const response = await fetch('api/user.php?action=status', {
                credentials: 'same-origin'
            });
            return await response.json();
        } catch (e) {
            console.error('Session check failed:', e);
            return { isLoggedIn: false };
        }
    },

    /** Logout current user (clears both local and MAL sessions) */
    logoutUser: async function() {
        try {
            const response = await fetch('api/user.php?action=logout', {
                credentials: 'same-origin'
            });
            return await response.json();
        } catch (e) {
            console.error('Logout request failed:', e);
            return { success: false };
        }
    },

    /** Fetch user's saved watchlist from database */
    getDBWatchlist: async function() {
        const response = await fetch('api/watchlist.php', {
            credentials: 'same-origin'
        });
        return await response.json();
    },

    /** Save an item to the user's database watchlist */
    saveToDBWatchlist: async function(mediaId, mediaType, status, progress, volumesProgress, score) {
        const response = await fetch('api/watchlist.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                media_id: mediaId,
                media_type: mediaType,
                status: status,
                progress: progress || 0,
                volumes_progress: volumesProgress || 0,
                score: score || 0
            })
        });
        return await response.json();
    },

    /** Delete an item from the user's database watchlist */
    deleteFromDBWatchlist: async function(mediaId, mediaType) {
        const response = await fetch('api/watchlist.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ media_id: mediaId, media_type: mediaType })
        });
        return await response.json();
    }
};
