const { useState } = React;

// SVG Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const MALLogoIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1.85 14.82l-3.32-3.32a.74.74 0 111.05-1.05l2.27 2.27 5.09-5.09a.74.74 0 111.05 1.05l-5.61 5.61a.73.73 0 01-1.05 0z"/></svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

window.LoginModal = function LoginModal({ onClose, onLoginSuccess }) {
    const handleMALRedirect = () => {
        window.location.href = 'api/auth.php?action=login';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-md">
            <div className="relative w-full max-w-sm bg-darkCard/95 border-2 border-animePurple rounded-xl p-8 text-center shadow-2xl glass-effect animate-slide-up">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer transition-colors"
                >
                    <CloseIcon />
                </button>

                {/* Brand Header */}
                <div className="mb-6 space-y-2">
                    <span className="font-orbitron font-black text-2xl tracking-widest text-white block">ANI<span className="text-animePurple">LOGUE</span></span>
                    <h3 className="font-orbitron text-xs font-bold text-animePurple-light tracking-widest uppercase">Cloud Synchronization</h3>
                </div>

                <div className="text-left text-xs text-gray-300 space-y-4 mb-6 leading-relaxed font-semibold border-b border-animePurple/15 pb-5">
                    <p>
                        💡 By default, your watchlists and progress are saved locally as a <strong className="text-white">Guest Account</strong> in this browser.
                    </p>
                    <p>
                        🔗 If you wish to access your watchlist on <strong className="text-white">other devices</strong> or <strong className="text-white">sync scores/ratings</strong>, please sign in with your official MyAnimeList account.
                    </p>
                </div>

                {/* Primary MAL Actions */}
                <div className="space-y-3.5">
                    <button 
                        type="button"
                        onClick={handleMALRedirect}
                        className="w-full py-3.5 bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron font-black text-xs tracking-widest rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-98 transition-all duration-300 shadow-neon-purple shadow-animePurple/25 cursor-pointer flex items-center justify-center space-x-3 border border-animePurple/40"
                    >
                        <MALLogoIcon />
                        <span>SIGN IN WITH MYANIMELIST</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-orbitron text-gray-500 font-bold uppercase tracking-wider">No MAL Account?</span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <a 
                        href="https://myanimelist.net/register.php"
                        target="_blank"
                        rel="noopener"
                        className="w-full py-3 bg-darkBg hover:bg-white/5 border border-animePurple/30 text-animePurple-light hover:text-white font-orbitron font-bold text-xs tracking-wider rounded-md flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer text-center"
                    >
                        <span>SIGN UP ON MYANIMELIST</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                </div>

                <div className="text-[10px] text-gray-600 font-semibold pt-4">
                    Secured by official MyAnimeList OAuth 2.0 PKCE protocol.
                </div>

            </div>
        </div>
    );
}
