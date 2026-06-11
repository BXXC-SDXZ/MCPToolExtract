'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import AddServerModal from '@/components/core/modals/AddServerModal';
import Search from '@/components/layout/Search';
import { Button } from '@/components/ui/button';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  LogIn,
  Menu,
  Network,
  Search as SearchIcon,
  SendHorizontal,
  Server,
  X,
} from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addServerOpen, setAddServerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <AddServerModal open={addServerOpen} onOpenChange={setAddServerOpen} />
      <Search open={searchOpen} onOpenChange={setSearchOpen} />

      <header
        className={`sticky top-4 z-50 w-full px-4 transition-all duration-300 sm:px-6 md:px-8 ${
          scrolled ? 'translate-y-0 bg-transparent' : '-translate-y-2 bg-transparent'
        }`}
      >
        <div
          className={`mx-auto w-full max-w-7xl rounded-md ${
            scrolled ? 'bg-white/98 shadow-sm backdrop-blur-sm' : 'bg-white'
          } border border-gray-200/80`}
        >
          <div className="px-4 py-3 sm:px-6 md:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-8">
                <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
                  <div className="flex items-center">
                    <div className="flex items-center rounded-md bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-2 shadow-sm transition-all hover:shadow-md">
                      <span className="text-lg font-light tracking-tight text-white">
                        <span className="font-medium">MCP</span>
                      </span>
                    </div>
                  </div>
                </Link>

                <nav className="hidden items-center space-x-3 lg:flex">
                  <Link
                    href="/servers"
                    className="inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                  >
                    <Server className="h-4 w-4" />
                    <span>Servers</span>
                  </Link>
                  <Link
                    href="/clients"
                    className="inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                  >
                    <Network className="h-4 w-4" />
                    <span>Clients</span>
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Blog</span>
                  </Link>
                </nav>
              </div>

              <div className="hidden items-center gap-4 lg:flex">
                <Button
                  variant="outline"
                  className="inline-flex w-64 items-center gap-2 border-gray-200 font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
                  onClick={() => setSearchOpen(true)}
                >
                  <SearchIcon className="h-4 w-4" />
                  Search
                  <kbd className="font-mono pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 text-[10px] font-medium text-gray-600 opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                  onClick={() => setAddServerOpen(true)}
                >
                  <SendHorizontal className="h-4 w-4" />
                  Add Server
                </Button>
                <Button
                  variant="ghost"
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:from-orange-600 hover:to-pink-600 hover:text-white hover:shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </div>

              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  className="rounded-md border border-transparent p-2 hover:border-gray-200 hover:bg-gray-50/80"
                  aria-label="Menu"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 text-gray-700" />
                  ) : (
                    <Menu className="h-5 w-5 text-gray-700" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto mt-2 w-full max-w-7xl overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm lg:hidden"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, staggerChildren: 0.1 }}
                className="p-4 sm:p-6"
              >
                <nav className="flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    className="inline-flex w-full items-center justify-between gap-2 border-gray-200 font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setSearchOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <SearchIcon className="h-4 w-4" />
                      Search
                    </div>
                    <kbd className="font-mono pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 text-[10px] font-medium text-gray-600 opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </Button>

                  <Link
                    href="/servers"
                    className="inline-flex items-center gap-2 rounded-md border border-transparent p-3 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Server className="h-4 w-4" />
                    <span>Servers</span>
                  </Link>

                  <Link
                    href="/clients"
                    className="inline-flex items-center gap-2 rounded-md border border-transparent p-3 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Network className="h-4 w-4" />
                    <span>Clients</span>
                  </Link>

                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 rounded-md border border-transparent p-3 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Blog</span>
                  </Link>

                  <div className="my-2 border-t border-gray-100" />

                  <Button
                    variant="outline"
                    className="inline-flex w-full items-center gap-2 rounded-md p-3 text-sm font-medium text-gray-600 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50/80 hover:text-gray-900"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setAddServerOpen(true);
                    }}
                  >
                    <SendHorizontal className="h-4 w-4" />
                    Add Server
                  </Button>

                  <Button
                    variant="ghost"
                    className="inline-flex w-full items-center gap-2 rounded-md bg-gradient-to-r from-orange-500 to-pink-500 p-3 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:from-orange-600 hover:to-pink-600 hover:text-white hover:shadow-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Header;
