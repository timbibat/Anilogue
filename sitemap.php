<?php
/**
 * Anilogue Dynamic XML Sitemap Generator
 * Fully compatible with search engines and standard specifications.
 * Fetches top trending anime/manga lists from MyAnimeList API to keep crawled list fresh.
 */
header("Content-Type: application/xml; charset=utf-8");

require_once 'config.php';

$baseUrl = "https://anilogue.free.nf";

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

// 1. Static Pages
$pages = [
    '' => ['priority' => '1.0', 'changefreq' => 'daily'],
    '?tab=home' => ['priority' => '0.9', 'changefreq' => 'daily'],
    '?tab=manga' => ['priority' => '0.9', 'changefreq' => 'daily'],
    '?tab=trending' => ['priority' => '0.8', 'changefreq' => 'daily'],
    '?tab=popular' => ['priority' => '0.8', 'changefreq' => 'weekly'],
    '?tab=watchlist' => ['priority' => '0.5', 'changefreq' => 'weekly']
];

foreach ($pages as $path => $meta) {
    echo "  <url>\n";
    echo "    <loc>" . $baseUrl . "/" . $path . "</loc>\n";
    echo "    <changefreq>" . $meta['changefreq'] . "</changefreq>\n";
    echo "    <priority>" . $meta['priority'] . "</priority>\n";
    echo "  </url>\n";
}

// Helper to make a rapid cURL request to MyAnimeList
function getSitemapMALItems($type, $rankingType) {
    $url = MAL_API_URL . '/' . $type . '/ranking?ranking_type=' . $rankingType . '&limit=20&fields=id';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $headers = [];
    $token = trim(MAL_CLIENT_ID);
    if (strlen($token) <= 45) {
        $headers[] = 'X-MAL-CLIENT-ID: ' . $token;
    } else {
        if (strpos(strtolower($token), 'bearer ') === 0) {
            $token = substr($token, 7);
        }
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 3);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        if (isset($data['data'])) {
            return $data['data'];
        }
    }
    return [];
}

// 2. Fetch Dynamic Anime Links (Top Airing)
$animeList = getSitemapMALItems('anime', 'airing');
if (empty($animeList)) {
    // Fallback if airing fails
    $animeList = getSitemapMALItems('anime', 'all');
}

foreach ($animeList as $item) {
    if (isset($item['node']['id'])) {
        $id = $item['node']['id'];
        echo "  <url>\n";
        echo "    <loc>" . $baseUrl . "/details?id=" . $id . "&amp;type=anime</loc>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.7</priority>\n";
        echo "  </url>\n";
    }
}

// 3. Fetch Dynamic Manga Links (Popular)
$mangaList = getSitemapMALItems('manga', 'bypopularity');
foreach ($mangaList as $item) {
    if (isset($item['node']['id'])) {
        $id = $item['node']['id'];
        echo "  <url>\n";
        echo "    <loc>" . $baseUrl . "/details?id=" . $id . "&amp;type=manga</loc>\n";
        echo "    <changefreq>weekly</changefreq>\n";
        echo "    <priority>0.6</priority>\n";
        echo "  </url>\n";
    }
}

echo '</urlset>' . "\n";
?>
