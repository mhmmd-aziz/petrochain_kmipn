<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'PETROCHAIN') }}</title>
        <link rel="icon" type="image/png" href="/images/favicon.png">

        <!-- SEO Primary Meta Tags -->
        <meta name="title" content="PETROCHAIN - Intelligent Fuel Subsidy Ecosystem">
        <meta name="description" content="PETROCHAIN adalah platform verifikasi cerdas dan audit trail berlapis menggunakan AI Computer Vision (YOLO & OCR) dan Blockchain Hyperledger untuk subsidi BBM yang tepat sasaran.">
        <meta name="keywords" content="BBM Bersubsidi, MyPertamina, Petrochain, AI YOLO, Blockchain, Hyperledger, SPBU, Subsidi Tepat, BPH Migas">
        <meta name="author" content="Tim PETROCHAIN">
        <meta name="robots" content="index, follow">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://petrochain.my.id/">
        <meta property="og:title" content="PETROCHAIN - Intelligent Fuel Subsidy Ecosystem">
        <meta property="og:description" content="Platform verifikasi ganda AI YOLO & STNK dengan Hyperledger Fabric untuk mengawal distribusi BBM nasional secara transparan dan anti-fraud.">
        <meta property="og:image" content="https://petrochain.my.id/images/hero_citizen.jpg">
        <meta property="og:site_name" content="PETROCHAIN">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://petrochain.my.id/">
        <meta property="twitter:title" content="PETROCHAIN - Intelligent Fuel Subsidy Ecosystem">
        <meta property="twitter:description" content="Platform verifikasi ganda AI YOLO & STNK dengan Hyperledger Fabric untuk mengawal distribusi BBM nasional secara transparan dan anti-fraud.">
        <meta property="twitter:image" content="https://petrochain.my.id/images/hero_citizen.jpg">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
