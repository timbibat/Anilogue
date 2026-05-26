<?php
/**
 * Anilogue MyAnimeList API v2 Proxy Endpoint
 * Securely forwards frontend requests to api.myanimelist.net v2,
 * appends OAuth2 Bearer Token headers, and handles comprehensive field mappings.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config.php';

// If MyAnimeList Client ID/Token is not configured, inform the frontend
if (!isMalClientConfigured()) {
    echo json_encode([
        'status' => 'unconfigured',
        'message' => 'MyAnimeList API Token is not configured in config.php.'
    ]);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper for comprehensive fields used across searches and lists
$listFields = 'id,title,main_picture,mean,synopsis,genres,num_episodes,start_season,media_type,status,rank,popularity';

// Detailed fields explicitly requested by the user's details cURL
$detailFields = 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,pictures,background,related_anime,related_manga,recommendations,studios,statistics';

// Manga Fields
$mangaListFields = 'id,title,main_picture,mean,synopsis,genres,num_volumes,num_chapters,media_type,status,rank,popularity';
$mangaDetailFields = 'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,created_at,updated_at,media_type,status,genres,my_list_status,num_volumes,num_chapters,authors{first_name,last_name},pictures,background,related_anime,related_manga,recommendations,serialization{name}';

switch ($action) {
    case 'manga_search':
        $query = isset($_GET['q']) ? $_GET['q'] : '';
        if (empty($query)) {
            echo json_encode(['error' => 'Query parameter "q" is required.']);
            exit;
        }
        $url = MAL_API_URL . '/manga?q=' . urlencode($query) . '&limit=20&fields=' . $mangaListFields;
        fetchAndMapMangaList($url);
        break;

    case 'manga_ranking':
        $type = isset($_GET['type']) ? $_GET['type'] : 'all';
        $allowedTypes = ['all', 'manga', 'novels', 'lightnovels', 'oneshots', 'doujin', 'manhwa', 'manhua', 'bypopularity', 'favorite'];
        if (!in_array($type, $allowedTypes)) {
            $type = 'all';
        }
        $url = MAL_API_URL . '/manga/ranking?ranking_type=' . $type . '&limit=20&fields=' . $mangaListFields;
        fetchAndMapMangaList($url);
        break;

    case 'manga_detail':
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id <= 0) {
            echo json_encode(['error' => 'Valid manga "id" parameter is required.']);
            exit;
        }
        $url = MAL_API_URL . '/manga/' . $id . '?fields=' . $mangaDetailFields;
        fetchAndMapMangaDetail($url);
        break;
    case 'search':
        $query = isset($_GET['q']) ? $_GET['q'] : '';
        if (empty($query)) {
            echo json_encode(['error' => 'Query parameter "q" is required.']);
            exit;
        }
        $url = MAL_API_URL . '/anime?q=' . urlencode($query) . '&limit=20&fields=' . $listFields;
        fetchAndMapMALList($url);
        break;

    case 'ranking':
        $type = isset($_GET['type']) ? $_GET['type'] : 'all';
        $allowedTypes = ['all', 'airing', 'upcoming', 'tv', 'ova', 'movie', 'special', 'bypopularity', 'favorite'];
        if (!in_array($type, $allowedTypes)) {
            $type = 'all';
        }
        $url = MAL_API_URL . '/anime/ranking?ranking_type=' . $type . '&limit=20&fields=' . $listFields;
        fetchAndMapMALList($url);
        break;

    case 'suggestions':
        $url = MAL_API_URL . '/anime/suggestions?limit=20&fields=' . $listFields;
        fetchAndMapMALList($url);
        break;

    case 'season':
        // Default to active season (e.g. 2026 spring)
        $year = isset($_GET['year']) ? intval($_GET['year']) : 2026;
        $season = isset($_GET['season']) ? $_GET['season'] : 'spring';
        $allowedSeasons = ['winter', 'spring', 'summer', 'fall'];
        if (!in_array($season, $allowedSeasons)) {
            $season = 'spring';
        }
        $url = MAL_API_URL . '/anime/season/' . $year . '/' . $season . '?limit=20&fields=' . $listFields;
        fetchAndMapMALList($url);
        break;

    case 'genre':
        $genreName = isset($_GET['name']) ? $_GET['name'] : 'Action';
        $url = MAL_API_URL . '/anime?q=' . urlencode($genreName) . '&limit=20&fields=' . $listFields;
        fetchAndMapMALList($url);
        break;

    case 'detail':
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id <= 0) {
            echo json_encode(['error' => 'Valid anime "id" parameter is required.']);
            exit;
        }
        $url = MAL_API_URL . '/anime/' . $id . '?fields=' . $detailFields;
        fetchAndMapMALDetail($url);
        break;

    case 'me':
        if (!isOauthAuthenticated()) {
            echo json_encode(['isLoggedIn' => false]);
            exit;
        }
        $url = MAL_API_URL . '/users/@me';
        $userData = makeMALRequest($url);
        if (isset($userData['error'])) {
            echo json_encode(['isLoggedIn' => false, 'error' => $userData['error']]);
        } else {
            echo json_encode([
                'isLoggedIn' => true,
                'username' => isset($userData['name']) ? $userData['name'] : 'MAL Guest',
                'picture' => isset($userData['picture']) ? $userData['picture'] : ''
            ]);
        }
        exit;

    case 'update_status':
        if (!isOauthAuthenticated()) {
            echo json_encode(['error' => 'You must be logged in via MyAnimeList to sync watchlists.']);
            exit;
        }
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $status = isset($_POST['status']) ? $_POST['status'] : 'plan_to_watch'; // 'watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'
        $type = isset($_POST['type']) ? $_POST['type'] : 'anime';
        
        if ($id <= 0) {
            echo json_encode(['error' => 'Valid id is required.']);
            exit;
        }
        
        $url = MAL_API_URL . '/' . ($type === 'manga' ? 'manga' : 'anime') . '/' . $id . '/my_list_status';
        $postFields = [
            'status' => $status
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT'); // MAL API uses PUT to update status
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postFields));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $headers = [
            'Authorization: Bearer ' . getOauthAccessToken(),
            'Content-Type: application/x-www-form-urlencoded'
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            echo $response;
        } else {
            echo json_encode([
                'error' => 'Failed to update MAL list status.',
                'http_code' => $httpCode,
                'response' => json_decode($response, true)
            ]);
        }
        exit;

    default:
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid action. Supported actions: search, ranking, suggestions, season, genre, detail, me, update_status, manga_search, manga_ranking, manga_detail.'
        ]);
        break;
}

/**
 * Perform a cURL request using the correct MyAnimeList authorization header.
 * Dynamically switches between Client ID (X-MAL-CLIENT-ID) and OAuth2 (Bearer) based on token length.
 */
function makeMALRequest($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [];
    
    // If user is authenticated via OAuth2, forward their Access Token. Otherwise fallback to client key.
    if (isOauthAuthenticated()) {
        $headers[] = 'Authorization: Bearer ' . getOauthAccessToken();
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
    
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
        curl_close($ch);
        return ['error' => 'CURL Error: ' . $error_msg];
    }
    
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        return [
            'error' => 'MyAnimeList API returned HTTP status code ' . $httpCode,
            'response' => json_decode($response, true)
        ];
    }

    return json_decode($response, true);
}

/**
 * Fetch a list response from MAL, map it to the frontend schema, and echo JSON.
 */
function fetchAndMapMALList($url) {
    $rawData = makeMALRequest($url);
    
    if (isset($rawData['error'])) {
        echo json_encode($rawData);
        exit;
    }

    $items = [];
    $dataNodes = isset($rawData['data']) ? $rawData['data'] : [];
    
    foreach ($dataNodes as $node) {
        $anime = isset($node['node']) ? $node['node'] : $node;
        $items[] = translateMALAnimeSchema($anime);
    }

    echo json_encode($items);
}

/**
 * Fetch a specific detail from MAL, map it to the frontend schema, and echo JSON.
 */
function fetchAndMapMALDetail($url) {
    $rawData = makeMALRequest($url);
    
    if (isset($rawData['error'])) {
        echo json_encode($rawData);
        exit;
    }

    $mapped = translateMALAnimeSchema($rawData);
    
    // Process pictures gallery
    if (isset($rawData['pictures'])) {
        $mapped['pictures'] = array_map(function($pic) {
            return isset($pic['large']) ? $pic['large'] : $pic['medium'];
        }, $rawData['pictures']);
        
        if (count($mapped['pictures']) > 1) {
            $mapped['banner'] = $mapped['pictures'][1];
        }
    }
    
    // Process related/recommendations arrays
    if (isset($rawData['recommendations'])) {
        $mapped['recommendations'] = array_slice(array_map(function($rec) {
            return translateMALAnimeSchema($rec['node']);
        }, $rawData['recommendations']), 0, 6);
    }
    
    // Process studios
    if (isset($rawData['studios'])) {
        $mapped['studios'] = array_map(function($studio) {
            return $studio['name'];
        }, $rawData['studios']);
    }

    echo json_encode($mapped);
}

/**
 * Map a single MyAnimeList API anime item object to the frontend expected properties.
 */
function translateMALAnimeSchema($anime) {
    $id = isset($anime['id']) ? $anime['id'] : 0;
    
    // Cover mapping
    $cover = '';
    if (isset($anime['main_picture'])) {
        $cover = isset($anime['main_picture']['large']) ? $anime['main_picture']['large'] : $anime['main_picture']['medium'];
    }
    
    // Format release year
    $year = 2026;
    if (isset($anime['start_season']['year'])) {
        $year = intval($anime['start_season']['year']);
    } elseif (isset($anime['start_date'])) {
        $year = intval(substr($anime['start_date'], 0, 4));
    }
    
    // Translate Genres objects
    $genres = [];
    if (isset($anime['genres'])) {
        foreach ($anime['genres'] as $g) {
            $genres[] = $g['name'];
        }
    }
    if (empty($genres)) {
        $genres = ['Anime'];
    }
    
    // Format Mean score rating
    $rating = '7.5';
    if (isset($anime['mean']) && $anime['mean'] > 0) {
        $rating = number_format($anime['mean'], 1);
    }

    // Media type translation
    $mediaType = isset($anime['media_type']) ? $anime['media_type'] : 'tv';
    $type = 'Series';
    if ($mediaType === 'movie') {
        $type = 'Movie';
    } elseif ($mediaType === 'ova' || $mediaType === 'special') {
        $type = 'OVA / Special';
    }
    
    $status = isset($anime['status']) ? $anime['status'] : '';
    $sameDay = ($status === 'currently_airing');

    // Parse rich detail specifications fields
    $rank = isset($anime['rank']) ? intval($anime['rank']) : 'N/A';
    $popularity = isset($anime['popularity']) ? intval($anime['popularity']) : 'N/A';
    $members = isset($anime['num_list_users']) ? number_format($anime['num_list_users']) : 'N/A';
    $scorers = isset($anime['num_scoring_users']) ? number_format($anime['num_scoring_users']) : 'N/A';
    
    $broadcast = 'N/A';
    if (isset($anime['broadcast']['string'])) {
        $broadcast = $anime['broadcast']['string'];
    }
    
    $source = isset($anime['source']) ? ucwords(str_replace('_', ' ', $anime['source'])) : 'Original';
    
    // Convert duration seconds to clean string (e.g. 24 minutes)
    $duration = '24 min';
    if (isset($anime['average_episode_duration']) && $anime['average_episode_duration'] > 0) {
        $duration = round($anime['average_episode_duration'] / 60) . ' min';
    }
    
    $ageRating = isset($anime['rating']) ? strtoupper(str_replace('_', '-', $anime['rating'])) : 'PG-13';
    $background = isset($anime['background']) ? $anime['background'] : '';

    return [
        'id' => $id,
        'title' => $anime['title'],
        'type' => $type,
        'episodes' => isset($anime['num_episodes']) && $anime['num_episodes'] > 0 ? $anime['num_episodes'] : 12,
        'year' => $year,
        'rating' => $rating,
        'synopsis' => isset($anime['synopsis']) ? $anime['synopsis'] : 'No description details available from MyAnimeList.',
        'genres' => $genres,
        'cover' => $cover,
        'banner' => $cover,
        'sameDay' => $sameDay,
        'popular' => isset($anime['mean']) && $anime['mean'] >= 8.0,
        'category' => count($genres) > 0 ? $genres[0] : 'Action',
        
        // Rich MAL Metadata Profile properties (Non-streaming site layout)
        'rank' => $rank,
        'popularity' => $popularity,
        'members' => $members,
        'scorers' => $scorers,
        'broadcast' => $broadcast,
        'source' => $source,
        'duration' => $duration,
        'ageRating' => $ageRating,
        'background' => $background
    ];
}

/**
 * Fetch a list of manga from MAL, map it to the frontend schema, and echo JSON.
 */
function fetchAndMapMangaList($url) {
    $rawData = makeMALRequest($url);
    
    if (isset($rawData['error'])) {
        echo json_encode($rawData);
        exit;
    }

    $items = [];
    $dataNodes = isset($rawData['data']) ? $rawData['data'] : [];
    
    foreach ($dataNodes as $node) {
        $manga = isset($node['node']) ? $node['node'] : $node;
        $items[] = translateMALMangaSchema($manga);
    }

    echo json_encode($items);
}

/**
 * Fetch a specific manga detail from MAL, map it, and echo JSON.
 */
function fetchAndMapMangaDetail($url) {
    $rawData = makeMALRequest($url);
    
    if (isset($rawData['error'])) {
        echo json_encode($rawData);
        exit;
    }

    $mapped = translateMALMangaSchema($rawData);
    
    // Process pictures gallery
    if (isset($rawData['pictures'])) {
        $mapped['pictures'] = array_map(function($pic) {
            return isset($pic['large']) ? $pic['large'] : $pic['medium'];
        }, $rawData['pictures']);
        
        if (count($mapped['pictures']) > 1) {
            $mapped['banner'] = $mapped['pictures'][1];
        }
    }
    
    // Process related/recommendations arrays
    if (isset($rawData['recommendations'])) {
        $mapped['recommendations'] = array_slice(array_map(function($rec) {
            return translateMALMangaSchema($rec['node']);
        }, $rawData['recommendations']), 0, 6);
    }

    echo json_encode($mapped);
}

/**
 * Map a single MyAnimeList API manga item object to the frontend expected properties.
 */
function translateMALMangaSchema($manga) {
    $id = isset($manga['id']) ? $manga['id'] : 0;
    
    // Cover mapping
    $cover = '';
    if (isset($manga['main_picture'])) {
        $cover = isset($manga['main_picture']['large']) ? $manga['main_picture']['large'] : $manga['main_picture']['medium'];
    }
    
    // Format release year
    $year = 2026;
    if (isset($manga['start_date'])) {
        $year = intval(substr($manga['start_date'], 0, 4));
    }
    
    // Translate Genres objects
    $genres = [];
    if (isset($manga['genres'])) {
        foreach ($manga['genres'] as $g) {
            $genres[] = $g['name'];
        }
    }
    if (empty($genres)) {
        $genres = ['Manga'];
    }
    
    // Format Mean score rating
    $rating = '7.8';
    if (isset($manga['mean']) && $manga['mean'] > 0) {
        $rating = number_format($manga['mean'], 1);
    }

    // Media type translation
    $mediaType = isset($manga['media_type']) ? $manga['media_type'] : 'manga';
    $type = ucwords($mediaType);
    
    $status = isset($manga['status']) ? ucwords(str_replace('_', ' ', $manga['status'])) : 'Publishing';

    // Parse rich detail specifications fields
    $rank = isset($manga['rank']) ? intval($manga['rank']) : 'N/A';
    $popularity = isset($manga['popularity']) ? intval($manga['popularity']) : 'N/A';
    $members = isset($manga['num_list_users']) ? number_format($manga['num_list_users']) : 'N/A';
    $scorers = isset($manga['num_scoring_users']) ? number_format($manga['num_scoring_users']) : 'N/A';
    
    // Chapters / Volumes
    $chapters = isset($manga['num_chapters']) && $manga['num_chapters'] > 0 ? $manga['num_chapters'] : 'N/A';
    $volumes = isset($manga['num_volumes']) && $manga['num_volumes'] > 0 ? $manga['num_volumes'] : 'N/A';
    
    // Authors formatting: MAL returns array of {node => {id, first_name, last_name}, role}
    $authorsList = [];
    if (isset($manga['authors'])) {
        foreach ($manga['authors'] as $author) {
            if (isset($author['node'])) {
                $node = $author['node'];
                $fullName = trim((isset($node['first_name']) ? $node['first_name'] : '') . ' ' . (isset($node['last_name']) ? $node['last_name'] : ''));
                if (!empty($fullName)) {
                    $authorsList[] = $fullName . ' (' . str_replace('_', ' ', $author['role']) . ')';
                }
            }
        }
    }
    $authorsStr = count($authorsList) > 0 ? implode(', ', $authorsList) : 'Unknown Author';

    // Serialization publishing details
    $serialization = 'N/A';
    if (isset($manga['serialization']) && count($manga['serialization']) > 0) {
        $serialization = $manga['serialization'][0]['name'];
    }

    $ageRating = isset($manga['nsfw']) && $manga['nsfw'] === 'white' ? 'R18+' : 'All Ages';
    $background = isset($manga['background']) ? $manga['background'] : '';

    return [
        'id' => $id,
        'title' => $manga['title'],
        'type' => $type,
        'chapters' => $chapters,
        'volumes' => $volumes,
        'year' => $year,
        'rating' => $rating,
        'synopsis' => isset($manga['synopsis']) ? $manga['synopsis'] : 'No description details available from MyAnimeList.',
        'genres' => $genres,
        'cover' => $cover,
        'banner' => $cover,
        'popular' => isset($manga['mean']) && $manga['mean'] >= 8.0,
        'category' => count($genres) > 0 ? $genres[0] : 'Action',
        
        // Custom Manga Metadata Profile properties
        'rank' => $rank,
        'popularity' => $popularity,
        'members' => $members,
        'scorers' => $scorers,
        'authors' => $authorsStr,
        'serialization' => $serialization,
        'ageRating' => $ageRating,
        'background' => $background
    ];
}

