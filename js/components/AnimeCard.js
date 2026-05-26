// SVG Icons
const StarIcon = ({ className = "w-4 h-4 fill-animeYellow text-animeYellow" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);

window.AnimeCard = function AnimeCard({ anime, onCardClick, toggleBookmark, myList }) {
    if (!anime) return null;
    const isBookmarked = myList.includes(anime.id);

    return (
        <div 
            onClick={() => onCardClick(anime)}
            className="w-[150px] sm:w-[190px] group/card relative flex flex-col space-y-2 cursor-pointer bg-darkCard/30 rounded-lg p-2 border border-animePurple/5 hover:border-animePurple/40 anime-card-hover"
        >
            
            {/* Poster Image frame with hover zoom */}
            <div className="relative h-[210px] sm:h-[265px] rounded-md overflow-hidden img-zoom-container bg-darkCard/90">
                <img 
                    src={anime.cover} 
                    alt={anime.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                
                {/* Neon Yellow Star Badge */}
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-animeYellow text-darkBg font-orbitron font-extrabold px-2 py-0.5 rounded text-[11px] shadow-lg shadow-animeYellow/25 border border-animeYellow/30 tracking-wide">
                    <StarIcon className="w-3 h-3 fill-darkBg text-darkBg" />
                    <span>{anime.rating}</span>
                </div>

                {/* Absolute Overlay Controls on hover */}
                <div className="absolute inset-0 bg-darkBg/80 backdrop-blur-xs flex flex-col justify-between p-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20">
                    
                    {/* Card top elements (Bookmark button) */}
                    <div className="flex justify-end">
                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleBookmark(anime.id); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors border ${isBookmarked ? 'bg-animeYellow/10 border-animeYellow text-animeYellow' : 'bg-darkBg/50 border-white/20 text-white hover:border-animePurple hover:text-animePurple'}`}
                        >
                            {isBookmarked ? <CheckIcon /> : <PlusIcon />}
                        </button>
                    </div>

                    {/* Card bottom details */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-300 font-bold">
                            <span>{anime.year}</span>
                            <span className="uppercase text-animePurple-light font-orbitron">{anime.type}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 truncate text-left">
                            {anime.genres.join(" | ")}
                        </div>
                    </div>

                </div>
            </div>

            {/* Title and stats label */}
            <div className="space-y-0.5 text-left">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-200 line-clamp-1 group-hover/card:text-animePurple transition-colors duration-200 font-poppins">
                    {anime.title}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium">
                    {anime.episodes} Episodes
                </p>
            </div>
        </div>
    );
}
