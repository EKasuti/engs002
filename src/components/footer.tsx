"use client"
import { useTheme } from '@/context/ThemeContext';
import React from 'react';

const Footer: React.FC = () => {
    const { isDarkMode } = useTheme();
    
    return (
        <footer className={`border-t ${isDarkMode ? 'border-[#333333] text-white' : 'border-[#B2B2B2] text-black'} text-center py-4`}>
            <p>Copyright &copy; 2025 | Engineering, Architecture, and Building Technology</p>
        </footer>
    );
};

export default Footer;
