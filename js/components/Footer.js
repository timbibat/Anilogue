// SVG Icons
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

window.Footer = function Footer() {
    return (
        <footer className="w-full bg-darkBg border-t border-animePurple/15 mt-20 py-12 px-4 md:px-8 text-center relative z-10">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
                
                {/* Column 1 Logo */}
                <div className="space-y-4 md:col-span-2">
                    <span className="font-orbitron font-black text-2xl tracking-widest text-white">ANI<span className="text-animePurple">LOGUE</span></span>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                        Experience high definition anime streaming designed for high speed, interactive community structures, and instant deployment protocols. Optimized for both modern desktop monitors and active smart view devices.
                    </p>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-animePurple-light">
                        <GlobeIcon />
                        <span>MyAnimeList API Engine • Active Live Sync Mode</span>
                    </div>
                </div>

                {/* Column 2 Navigation Links */}
                <div className="space-y-3">
                    <h4 className="font-orbitron font-extrabold text-xs text-white uppercase tracking-wider">Navigations</h4>
                    <ul className="text-xs text-gray-400 space-y-2 font-medium">
                        <li><a href="#" className="hover:text-animePurple transition-colors">Featured Series</a></li>
                        <li><a href="#" className="hover:text-animePurple transition-colors">Same Day Releases</a></li>
                        <li><a href="#" className="hover:text-animePurple transition-colors">Popular Movies</a></li>
                        <li><a href="#" className="hover:text-animePurple transition-colors">Interactive Catalog</a></li>
                    </ul>
                </div>

                {/* Column 3 Social Medias */}
                <div className="space-y-3">
                    <h4 className="font-orbitron font-extrabold text-xs text-white uppercase tracking-wider">Connect With Us</h4>
                    <ul className="text-xs text-gray-400 space-y-2 font-medium">
                        <li><a href="#" className="hover:text-animePurple-light transition-colors flex items-center space-x-1.5"><span>Discord Server</span> <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1 py-0.5 rounded">NEW</span></a></li>
                        <li><a href="#" className="hover:text-animePurple-light transition-colors">Official Twitter (X)</a></li>
                        <li><a href="#" className="hover:text-animePurple-light transition-colors">Instagram Portal</a></li>
                        <li><a href="#" className="hover:text-animePurple-light transition-colors">GitHub Repository</a></li>
                    </ul>
                </div>

            </div>

            <div className="max-w-[1400px] mx-auto border-t border-animePurple/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-medium">
                <div>
                    © 2026 ANILOGUE. All rights designated. Driven by MyAnimeList API v2.
                </div>
                <div>
                    Created by Timothy Irwin Bibat
                </div>
                <div className="flex space-x-4 mt-4 sm:mt-0">
                    <a href="#" className="hover:text-animePurple transition-colors">Privacy Charter</a>
                    <a href="#" className="hover:text-animePurple transition-colors">Terms of Operations</a>
                    <a href="#" className="hover:text-animePurple transition-colors">Support Channels</a>
                </div>
            </div>
        </footer>
    );
}
