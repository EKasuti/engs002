"use client"

import Link from 'next/link';
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { useTheme } from "@/context/ThemeContext";

const Navbar: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const pathname = usePathname();

    const navItems = [
        { title: "Home", href: "/" },
        { title: "Case Studies", href: "/casestudies"},
        { title: "Map", href: "/map"},
    ];

    return (
        <nav className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} flex items-center p-4`}>
            <div className="text-2xl mr-4 font-bold">ENGS 002</div>

            {/* Navlinks */}
            <div className="flex-grow flex justify-center">
                <ul className={`flex space-x-6 p-2 px-20 border ${isDarkMode ? 'border-[#333333]' : 'border-[#B2B2B2]'} rounded-[20px]`}>
                    {navItems.map(item => (
                        <li key={item.href} className={pathname === item.href ? "text-primary font-bold" : "font-medium"}>
                            <Link href={item.href} className={pathname === item.href ? "text-primary" : "hover:text-primary"}>
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <Button className="bg-primary text-white rounded-[20px]">
                    Try for Free
                </Button>
            </div>
            <button onClick={toggleDarkMode} className="ml-4">
                {isDarkMode ? (
                    <Sun className="h-6 w-6 text-yellow-500"/>
                ) : (
                    <Moon className="h-6 w-6 text-gray-800"/>
                )}
            </button>
        </nav>
    );
};

export default Navbar;
