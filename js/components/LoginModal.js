const { useState } = React;

// SVG Icons
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const MALLogoIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm-1.85 14.82l-3.32-3.32a.74.74 0 111.05-1.05l2.27 2.27 5.09-5.09a.74.74 0 111.05 1.05l-5.61 5.61a.73.73 0 01-1.05 0z"/></svg>
);

window.LoginModal = function LoginModal({ onClose, onLoginSuccess }) {
    const [usernameField, setUsernameField] = useState("");
    const [passwordField, setPasswordField] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleMALRedirect = () => {
        window.location.href = 'api/auth.php?action=login';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (usernameField.trim() === "") {
            setErrorMsg("Username is required");
            return;
        }
        if (passwordField.length < 4) {
            setErrorMsg("Password must be at least 4 characters");
            return;
        }

        // Mock login success
        onLoginSuccess(usernameField);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-md">
            <div className="relative w-full max-w-sm bg-darkCard/95 border-2 border-animePurple rounded-xl p-8 text-center shadow-2xl glass-effect animate-slide-up">
                
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
                >
                    <CloseIcon />
                </button>

                <div className="mb-6">
                    <span className="font-orbitron font-black text-2xl tracking-widest text-white">ANI<span className="text-animePurple">LOGUE</span></span>
                    <p className="text-xs text-gray-400 mt-1">Unlock live synchronizations with MyAnimeList</p>
                </div>

                {/* Primary: MAL OAuth2 Link Trigger */}
                <div className="space-y-4 mb-6">
                    <button 
                        onClick={handleMALRedirect}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-orbitron font-bold text-xs tracking-wider rounded-md flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg shadow-blue-600/25 active:scale-98 cursor-pointer border border-blue-500/20"
                    >
                        <MALLogoIcon />
                        <span>CONTINUE WITH MYANIMELIST</span>
                    </button>
                    
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-orbitron text-gray-500 font-bold uppercase tracking-wider">OR GUEST ENTRY</span>
                        <div className="flex-grow border-t border-white/5"></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light">USERNAME</label>
                        <input 
                            type="text" 
                            value={usernameField}
                            onChange={(e) => setUsernameField(e.target.value)}
                            placeholder="Enter your nickname" 
                            className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light">PASSWORD</label>
                        <input 
                            type="password" 
                            value={passwordField}
                            onChange={(e) => setPasswordField(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                        />
                    </div>

                    {errorMsg && (
                        <div className="text-xs font-semibold text-red-400 text-left bg-red-950/20 border border-red-900/35 px-3 py-2 rounded">
                            {errorMsg}
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron font-black text-xs tracking-widest rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-98 transition-all duration-300 shadow-neon-purple shadow-animePurple/25 cursor-pointer"
                    >
                        ACTIVATE GUEST PORTAL
                    </button>
                </form>

                <div className="mt-6 text-[10px] text-gray-500 font-medium">
                    Don't have a portal key? <a href="#" onClick={(e) => { e.preventDefault(); setUsernameField("OtakuPro"); }} className="text-animePurple hover:underline">Instant Guest Login</a>
                </div>

            </div>
        </div>
    );
}
