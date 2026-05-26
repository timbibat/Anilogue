const { useState, useEffect } = React;
const apiService = window.apiService;

window.CategoryTabCatalog = function CategoryTabCatalog({ onCardClick, toggleBookmark, myList }) {
    const categories = ["Airing Now", "Action", "Romance", "Comedy", "Sci-Fi", "Fantasy", "Drama", "Movies"];
    const [activeCategory, setActiveCategory] = useState("Airing Now");
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchCategoryData() {
            setLoading(true);
            setError(null);
            try {
                let data = [];
                if (activeCategory === "Airing Now") {
                    data = await apiService.getAnimeRanking("airing");
                } else if (activeCategory === "Movies") {
                    data = await apiService.getAnimeRanking("movie");
                } else {
                    data = await apiService.getAnimeByGenre(activeCategory);
                }
                
                if (isMounted) {
                    // Check if it returned api unconfigured state
                    if (data && data.isUnconfigured) {
                        setAnimeList([]);
                    } else {
                        setAnimeList(data || []);
                    }
                }
            } catch (err) {
                console.error("Error loading category catalog:", err);
                if (isMounted) {
                    setError("Could not retrieve catalog titles.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchCategoryData();
        return () => { isMounted = false; };
    }, [activeCategory]);

    return (
        <div className="space-y-6 pt-6">
            
            {/* Header Heading */}
            <div className="text-left">
                <h2 className="font-orbitron font-extrabold text-lg sm:text-2xl text-white uppercase tracking-wider">
                    Explore Categories
                </h2>
                <p className="text-xs text-gray-400 font-medium tracking-wide mt-0.5">Filter by specific animation types and thematic genres</p>
            </div>

            {/* Dynamic Tabs list */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-300 font-orbitron tracking-wider flex-none border uppercase ${activeCategory === cat ? 'bg-animePurple border-animePurple text-white shadow-neon-purple shadow-animePurple/20' : 'bg-darkCard/40 border-animePurple/15 text-gray-400 hover:text-white hover:border-animePurple/40'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Catalog Grid Cards displaying list */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-animePurple border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-400 font-semibold text-xs bg-red-950/15 border border-red-900/30 rounded-lg max-w-md mx-auto">
                    {error}
                </div>
            ) : animeList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
                    <span className="text-sm font-semibold">No titles found in this category yet.</span>
                    <span className="text-xs">Check back soon for upcoming simulcasts!</span>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                    {animeList.map(anime => (
                        <AnimeCard 
                            key={anime.id} 
                            anime={anime} 
                            onCardClick={onCardClick} 
                            toggleBookmark={toggleBookmark}
                            myList={myList}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
