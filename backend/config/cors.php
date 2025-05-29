<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'storage/*',          // Add this for storage files
        'product_images/*'    // Add your specific image route
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        
        'http://localhost:3000',  // Your React/Ant Design frontend
        'http://127.0.0.1:8000'   // Laravel backend
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Content-Disposition'  // Important for file downloads
    ],

    'max_age' => 0,

    'supports_credentials' => false, // Set to true if using cookies/auth
];