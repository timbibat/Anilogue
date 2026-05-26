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
    const [activeMode, setActiveMode] = useState("login"); // 'login' | 'register'
    const [usernameField, setUsernameField] = useState("");
    const [emailField, setEmailField] = useState("");
    const [passwordField, setPasswordField] = useState("");
    const [confirmPasswordField, setConfirmPasswordField] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetFields = () => {
        setUsernameField("");
        setEmailField("");
        setPasswordField("");
        setConfirmPasswordField("");
        setErrorMsg("");
        setSuccessMsg("");
    };

    const switchMode = (mode) => {
        resetFields();
        setActiveMode(mode);
    };

    const handleMALRedirect = () => {
        window.location.href = 'api/auth.php?action=login';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (usernameField.trim() === "") {
            setErrorMsg("Username or email is required.");
            return;
        }
        if (passwordField.length < 6) {
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await window.apiService.loginLocalUser(usernameField, passwordField);
            if (res.success) {
                setSuccessMsg("Login successful! Redirecting...");
                setTimeout(() => {
                    onLoginSuccess(res.user.username, 'local');
                }, 600);
            } else {
                setErrorMsg(res.error || "Login failed. Please try again.");
            }
        } catch (err) {
            setErrorMsg("Connection error. Please check your network.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (usernameField.trim().length < 3) {
            setErrorMsg("Username must be at least 3 characters.");
            return;
        }
        if (!emailField.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            setErrorMsg("Please enter a valid email address.");
            return;
        }
        if (passwordField.length < 6) {
            setErrorMsg("Password must be at least 6 characters.");
            return;
        }
        if (passwordField !== confirmPasswordField) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await window.apiService.registerLocalUser(usernameField, emailField, passwordField);
            if (res.success) {
                setSuccessMsg("Account created! Logging you in...");
                setTimeout(() => {
                    onLoginSuccess(res.user.username, 'local');
                }, 600);
            } else {
                setErrorMsg(res.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setErrorMsg("Connection error. Please check your network.");
        } finally {
            setIsSubmitting(false);
        }
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
                <div className="mb-5">
                    <span className="font-orbitron font-black text-2xl tracking-widest text-white">ANI<span className="text-animePurple">LOGUE</span></span>
                    <p className="text-xs text-gray-400 mt-1">
                        {activeMode === "login" ? "Sign in to your account" : "Create your Anilogue account"}
                    </p>
                </div>

                {/* Login / Register Tab Switcher */}
                <div className="flex mb-6 bg-darkBg/80 rounded-lg p-1 border border-animePurple/15">
                    <button
                        onClick={() => switchMode("login")}
                        className={`flex-1 py-2 rounded-md text-xs font-orbitron font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                            activeMode === "login"
                                ? "bg-animePurple text-white shadow-lg shadow-animePurple/30"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        SIGN IN
                    </button>
                    <button
                        onClick={() => switchMode("register")}
                        className={`flex-1 py-2 rounded-md text-xs font-orbitron font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                            activeMode === "register"
                                ? "bg-animePurple text-white shadow-lg shadow-animePurple/30"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        REGISTER
                    </button>
                </div>

                {/* ═══════ LOGIN FORM ═══════ */}
                {activeMode === "login" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light flex items-center space-x-1.5">
                                <UserIcon />
                                <span>USERNAME OR EMAIL</span>
                            </label>
                            <input 
                                type="text" 
                                value={usernameField}
                                onChange={(e) => setUsernameField(e.target.value)}
                                placeholder="Enter your username or email" 
                                className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                                autoComplete="username"
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light flex items-center space-x-1.5">
                                <LockIcon />
                                <span>PASSWORD</span>
                            </label>
                            <input 
                                type="password" 
                                value={passwordField}
                                onChange={(e) => setPasswordField(e.target.value)}
                                placeholder="••••••••" 
                                className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                                autoComplete="current-password"
                            />
                        </div>

                        {errorMsg && (
                            <div className="text-xs font-semibold text-red-400 text-left bg-red-950/20 border border-red-900/35 px-3 py-2 rounded">
                                {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="text-xs font-semibold text-green-400 text-left bg-green-950/20 border border-green-900/35 px-3 py-2 rounded">
                                {successMsg}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron font-black text-xs tracking-widest rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-98 transition-all duration-300 shadow-neon-purple shadow-animePurple/25 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-white/5"></div>
                            <span className="flex-shrink mx-4 text-[9px] font-orbitron text-gray-500 font-bold uppercase tracking-wider">OR CONNECT WITH</span>
                            <div className="flex-grow border-t border-white/5"></div>
                        </div>

                        {/* MAL OAuth Button */}
                        <button 
                            type="button"
                            onClick={handleMALRedirect}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-orbitron font-bold text-xs tracking-wider rounded-md flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg shadow-blue-600/25 active:scale-98 cursor-pointer border border-blue-500/20"
                        >
                            <MALLogoIcon />
                            <span>CONTINUE WITH MYANIMELIST</span>
                        </button>
                    </form>
                )}

                {/* ═══════ REGISTER FORM ═══════ */}
                {activeMode === "register" && (
                    <form onSubmit={handleRegister} className="space-y-3.5">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light flex items-center space-x-1.5">
                                <UserIcon />
                                <span>USERNAME</span>
                            </label>
                            <input 
                                type="text" 
                                value={usernameField}
                                onChange={(e) => setUsernameField(e.target.value)}
                                placeholder="Choose a username (min. 3 chars)" 
                                className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                                autoComplete="username"
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light flex items-center space-x-1.5">
                                <MailIcon />
                                <span>EMAIL ADDRESS</span>
                            </label>
                            <input 
                                type="email" 
                                value={emailField}
                                onChange={(e) => setEmailField(e.target.value)}
                                placeholder="yourname@email.com" 
                                className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light flex items-center space-x-1.5">
                                <LockIcon />
                                <span>PASSWORD</span>
                            </label>
                            <input 
                                type="password" 
                                value={passwordField}
                                onChange={(e) => setPasswordField(e.target.value)}
                                placeholder="Min. 6 characters" 
                                className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                                autoComplete="new-password"
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-animePurple-light flex items-center space-x-1.5">
                                <LockIcon />
                                <span>CONFIRM PASSWORD</span>
                            </label>
                            <input 
                                type="password" 
                                value={confirmPasswordField}
                                onChange={(e) => setConfirmPasswordField(e.target.value)}
                                placeholder="Re-enter your password" 
                                className="w-full bg-darkBg border border-animePurple/20 rounded-md px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-animePurple focus:ring-1 focus:ring-animePurple transition-all"
                                autoComplete="new-password"
                            />
                        </div>

                        {errorMsg && (
                            <div className="text-xs font-semibold text-red-400 text-left bg-red-950/20 border border-red-900/35 px-3 py-2 rounded">
                                {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="text-xs font-semibold text-green-400 text-left bg-green-950/20 border border-green-900/35 px-3 py-2 rounded">
                                {successMsg}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-gradient-to-r from-animePurple to-purple-800 text-white font-orbitron font-black text-xs tracking-widest rounded-md hover:from-purple-500 hover:to-purple-700 active:scale-98 transition-all duration-300 shadow-neon-purple shadow-animePurple/25 cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                        </button>

                        <p className="text-[10px] text-gray-500 font-medium pt-1">
                            By registering, your watchlist data will be saved securely to our database.
                        </p>
                    </form>
                )}

            </div>
        </div>
    );
}
