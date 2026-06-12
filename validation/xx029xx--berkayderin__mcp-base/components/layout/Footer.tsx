import React from 'react';

import Link from 'next/link';

import { FaDiscord, FaGithub, FaXTwitter } from 'react-icons/fa6';
import { IoIosMail } from 'react-icons/io';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 pt-12 text-white">
      <div className="container mx-auto px-4">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" className="mb-6 flex items-center transition-opacity hover:opacity-90">
              <div className="flex items-center">
                <div className="flex items-center rounded-md bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-2 shadow-sm transition-all hover:shadow-md">
                  <span className="text-lg font-light tracking-tight text-white">
                    <span className="font-medium">MCP</span>
                  </span>
                </div>
              </div>
            </Link>
            <p className="mb-6 text-sm text-gray-400 md:text-base">
              The largest collection of MCP Servers, featuring Awesome MCP Servers and Claude MCP
              integration.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 transition-colors hover:text-white">
                <FaXTwitter size={20} />
              </Link>
              <Link href="#" className="text-gray-400 transition-colors hover:text-white">
                <FaGithub size={20} />
              </Link>
              <Link href="#" className="text-gray-400 transition-colors hover:text-white">
                <FaDiscord size={20} />
              </Link>
              <Link href="#" className="text-gray-400 transition-colors hover:text-white">
                <IoIosMail size={20} />
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="mb-4 text-base font-medium">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  Model Context Protocol
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  MCP Starter Guide
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  Claude MCP Servers
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-4 text-base font-medium">Community</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  Telegram
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  Discord
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  GitHub
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-4 text-base font-medium">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy-policy"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="group relative text-gray-400 transition-colors hover:text-white"
                >
                  Terms of Service
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center border-t border-gray-800 py-6 text-center text-sm text-gray-400">
          <p>©{new Date().getFullYear()} model-context-protocol. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
