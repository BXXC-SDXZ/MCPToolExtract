import React from 'react';

import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { GridPattern } from '@/components/magicui/grid-pattern';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { Cover } from '@/components/ui/cover';

const HeadSection = () => {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <GridPattern className="opacity-80" width={30} height={30} strokeDasharray="1 3" />
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
            <span className="mr-2">🚀</span>
            <AnimatedShinyText shimmerWidth={150}>+500 MCP Servers in list</AnimatedShinyText>
          </div>
        </div>

        <h1 className="mb-6 text-5xl font-bold md:text-7xl">
          <span className="text-gray-900">Find Awesome </span>
          <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            MCP <Cover>Servers</Cover> and <Cover>Clients</Cover>
          </span>
        </h1>

        <p className="mb-10 text-xl text-gray-600 md:text-2xl">
          The largest collection of MCP Servers.
        </p>

        <div className="flex justify-center">
          <InteractiveHoverButton>Become a Member</InteractiveHoverButton>
        </div>
      </div>
    </main>
  );
};

export default HeadSection;
