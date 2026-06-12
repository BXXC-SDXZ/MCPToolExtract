import React from 'react';

import { AnimatedSpan, Terminal } from '@/components/magicui/terminal';

const ProtocolBlock = () => {
  return (
    <div className="flex justify-center py-5">
      <Terminal className="w-full max-w-2xl">
        <AnimatedSpan delay={1000} className="text-emerald-700">
          $ mcp --version
        </AnimatedSpan>
        <AnimatedSpan delay={1500} className="text-slate-700">
          Model Context Protocol 2024-11-05
        </AnimatedSpan>
        <AnimatedSpan delay={2000} className="text-emerald-700">
          $ mcp --info
        </AnimatedSpan>
        <AnimatedSpan delay={2500} className="font-medium text-cyan-700">
          # Model Context Protocol - The Universal AI Connection Standard
        </AnimatedSpan>
        <AnimatedSpan delay={3000} className="text-slate-700">
          MCP connects AI assistants to the systems where data lives.
        </AnimatedSpan>
        <AnimatedSpan delay={3500} className="text-slate-700">
          Think of it like a USB-C port for AI applications.
        </AnimatedSpan>
        <AnimatedSpan delay={4000} className="text-emerald-700">
          $ mcp --features
        </AnimatedSpan>
        <AnimatedSpan delay={4500} className="text-amber-700">
          - Universal access to data sources
        </AnimatedSpan>
        <AnimatedSpan delay={5000} className="text-amber-700">
          - Secure, standardized connections
        </AnimatedSpan>
        <AnimatedSpan delay={5500} className="text-amber-700">
          - Reusable connectors ecosystem
        </AnimatedSpan>
        <AnimatedSpan delay={6000} className="text-emerald-700">
          $ _
        </AnimatedSpan>
      </Terminal>
    </div>
  );
};

export default ProtocolBlock;
