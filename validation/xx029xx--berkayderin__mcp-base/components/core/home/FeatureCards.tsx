'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import InfiniteMovingCards from '@/components/core/home/InfiniteMovingCards';

import { getTopClients } from '@/backend/queries/clients';
import { getTopServers } from '@/backend/queries/servers';
import { Card } from '@/backend/types/types';

import { ArrowRight } from 'lucide-react';

const FeatureCards = () => {
  const [topServers, setTopServers] = useState<Card[]>([]);
  const [topClients, setTopClients] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);

  const fetchTopServers = async () => {
    try {
      const servers = await getTopServers(10);
      setTopServers(servers);
    } catch (error) {
      console.error('Error fetching top servers:', error);
      setTopServers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopClients = async () => {
    try {
      const clients = await getTopClients(10);
      setTopClients(clients);
    } catch (error) {
      console.error('Error fetching top clients:', error);
      setTopClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopServers();
    fetchTopClients();
  }, []);

  return (
    <div className="flex w-full flex-col items-center space-y-16 border-t border-slate-200 bg-gray-50 py-12">
      <div className="w-full max-w-7xl space-y-8">
        <div className="flex items-center justify-between px-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured MCP Servers</h2>
          <Link
            href="/servers"
            className="group flex items-center gap-2 rounded-md border border-orange-200 bg-white px-4 py-1.5 text-sm font-medium text-orange-500 transition-all duration-200 hover:border-orange-400"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
          </div>
        ) : topServers.length > 0 ? (
          <InfiniteMovingCards items={topServers} direction="left" speed="slow" type="servers" />
        ) : (
          <div className="flex h-32 items-center justify-center text-gray-500">
            No servers found
          </div>
        )}
      </div>

      <div className="w-full max-w-7xl space-y-8">
        <div className="flex items-center justify-between px-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured MCP Clients</h2>
          <Link
            href="/clients"
            className="group flex items-center gap-2 rounded-md border border-orange-200 bg-white px-4 py-1.5 text-sm font-medium text-orange-500 transition-all duration-200 hover:border-orange-400"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
        {clientsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
          </div>
        ) : topClients.length > 0 ? (
          <InfiniteMovingCards items={topClients} direction="right" speed="slow" type="clients" />
        ) : (
          <div className="flex h-32 items-center justify-center text-gray-500">
            No clients found
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureCards;
