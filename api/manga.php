<?php
/**
 * Anilogue MyAnimeList API v2 Manga Proxy Endpoint
 * Securely forwards frontend manga requests to api.myanimelist.net v2,
 * appends OAuth2 Bearer Token headers, and handles comprehensive field mappings.
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

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
        $allowedTypes = ['all', 'manga', 'novels', 'oneshots', 'doujin', 'manhwa', 'manhua', 'bypopularity', 'favorite'];
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

    case 'update_status':
        if (!isOauthAuthenticated()) {
            echo json_encode(['error' => 'You must be logged in via MyAnimeList to sync watchlists.']);
            exit;
        }
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        $status = isset($_POST['status']) ? $_POST['status'] : 'plan_to_watch'; // 'watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch'
        
        if ($id <= 0) {
            echo json_encode(['error' => 'Valid id is required.']);
            exit;
        }
        
        $url = MAL_API_URL . '/manga/' . $id . '/my_list_status';
        $postFields = [
            'status' => $status
        ];
        if (isset($_POST['score'])) {
            $postFields['score'] = intval($_POST['score']);
        }
        if (isset($_POST['num_volumes_read'])) {
            $postFields['num_volumes_read'] = intval($_POST['num_volumes_read']);
        }
        if (isset($_POST['num_chapters_read'])) {
            $postFields['num_chapters_read'] = intval($_POST['num_chapters_read']);
        }
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
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
        break;

    case 'delete_status':
        if (!isOauthAuthenticated()) {
            echo json_encode(['error' => 'You must be logged in via MyAnimeList to sync watchlists.']);
            exit;
        }
        $id = isset($_POST['id']) ? intval($_POST['id']) : 0;
        
        if ($id <= 0) {
            echo json_encode(['error' => 'Valid id is required.']);
            exit;
        }
        
        $url = MAL_API_URL . '/manga/' . $id . '/my_list_status';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $headers = [
            'Authorization: Bearer ' . getOauthAccessToken(),
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200 || $httpCode === 204) {
            echo json_encode(['status' => 'deleted', 'message' => 'Manga removed from your MyAnimeList successfully.']);
        } else {
            echo json_encode([
                'error' => 'Failed to delete MAL list item.',
                'http_code' => $httpCode,
                'response' => json_decode($response, true)
            ]);
        }
        break;

    default:
        echo json_encode(['error' => 'Action path not supported or specified.']);
        break;
}

/**
 * Execute network requests using Curl and secure authentication headers.
 */
function makeMALRequest($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [];
    if (isOauthAuthenticated()) {
        $headers[] = 'Authorization: Bearer ' . getOauthAccessToken();
    } else {
        $headers[] = 'X-MAL-CLIENT-ID: ' . MAL_CLIENT_ID;
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    }
    
    return [
        'error' => 'HTTP Connection error.',
        'http_code' => $httpCode,
        'response' => json_decode($response, true)
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
    if (isset($manga['serialization']) && count($manga['serialization']) > 0 && isset($manga['serialization'][0]['name'])) {
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
        'my_list_status' => isset($manga['my_list_status']) ? $manga['my_list_status'] : null,
        'background' => $background
    ];
}
