import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogOut, User, Settings } from 'lucide-react';

// The Navbar now receives 'admin' and 'logout' as props
const Navbar = ({ admin, logout }) => {
  // Helper function moved here
  const getInitials = (name) => {
    return (
      name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'A'
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1D2B53] via-[#1D2B53] to-[#1a2547] text-white shadow-lg border-b border-white/10 backdrop-blur-sm h-16">
      <div className="container mx-auto flex items-center justify-between h-full px-4">
        {/* Left Section: Logo and Brand Name */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <img src="logo.png" alt="Nucleus Logo" className="h-[2.6rem] w-[3.1rem] object-contain rounded-full transition-transform group-hover:scale-110 shadow-lg" />
            <div className="absolute inset-0 rounded-full bg-white/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Nucleus
            </span>
            <span className="text-[0.75rem] text-gray-300 -mt-1 font-light tracking-wide">
              by Alumns
            </span>
          </div>
        </div>

        {/* Right Section: Search and User Profile Dropdown */}
        <div className="hidden md:flex items-center space-x-4">
      
          <Separator orientation="vertical" className="h-6 bg-gray-500/50" />
          <div className="hidden sm:block">
            {/* We use 'text-gray-200' and 'text-gray-400' for better contrast on the dark navbar */}
            <p className="text-sm font-medium text-gray-200">Welcome back,</p>
            <p className="text-sm text-muted-foreground">{admin?.name}</p>
          </div>

          <Separator orientation="vertical" className="h-6 bg-gray-500/50" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={admin?.avatar} alt={admin?.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials(admin?.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {admin?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {admin?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;