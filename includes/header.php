<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Optimization -->
    <title>ANILOGUE | Watch Premium Anime Online</title>
    <meta name="description" content="Stream the latest anime releases straight from Japan. High-speed streaming, dark-mode premium player, same-day releases, and popular hits. Driven live by MyAnimeList API on anilogue.free.nf.">
    <meta name="keywords" content="anime, streaming, watch anime, subbed, dubbed, myanimelist, live anime, anilogue, premium anime">
    <meta name="author" content="Anilogue Interactive">
    
    <!-- Favicon Icon -->
    <link rel="icon" type="image/png" href="images/favicon.png">
    
    <!-- Premium Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Custom Style overrides -->
    <link rel="stylesheet" href="style.css">
    
    <!-- Tailwind CSS v3 CDN Setup -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        animePurple: {
                            light: '#c084fc',
                            DEFAULT: '#8b5cf6',
                            dark: '#6d28d9',
                            glow: '#a855f7',
                        },
                        animeYellow: {
                            DEFAULT: '#fbbf24',
                            glow: '#fef08a',
                            neon: '#eab308'
                        },
                        darkBg: '#06010d',
                        darkCard: '#120224',
                        darkHeader: 'rgba(6, 1, 13, 0.85)'
                    },
                    fontFamily: {
                        poppins: ['Poppins', 'sans-serif'],
                        orbitron: ['Orbitron', 'sans-serif'],
                    },
                    boxShadow: {
                        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.45)',
                        'neon-yellow': '0 0 15px rgba(234, 179, 8, 0.35)',
                        'glow-line': '0 1px 10px rgba(168, 85, 247, 0.3)'
                    }
                }
            }
        }
    </script>
    
    <!-- Core React CDN Libraries -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <!-- In-Browser Babel Compiler for JSX scripts -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-darkBg text-gray-100 font-poppins min-h-screen grid-bg overflow-x-hidden selection:bg-animePurple selection:text-white">
