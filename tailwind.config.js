import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    DEFAULT: '#0D827C',
                    dark: '#064E4B',
                    darker: '#033331',
                    light: '#16B8A6',
                    accent: '#14B8A6',
                    subtle: '#E6F6F5',
                    lightest: '#F0FDFA',
                },
            },
        },
    },

    plugins: [forms],
};
