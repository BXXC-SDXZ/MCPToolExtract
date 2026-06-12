import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { Card } from '@/backend/types/types';

import { cn } from '@/lib/utils';

import { Star } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';

type InfiniteMovingCardsProps = {
  items: Card[];
  direction?: 'left' | 'right';
  speed?: 'slow' | 'medium' | 'fast';
  pauseOnHover?: boolean;
  className?: string;
  type?: 'servers' | 'clients';
};

const InfiniteMovingCards = ({
  items,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
  type = 'servers',
}: InfiniteMovingCardsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      if (direction === 'left') {
        containerRef.current.style.setProperty('--animation-direction', 'forwards');
      } else {
        containerRef.current.style.setProperty('--animation-direction', 'reverse');
      }
    }
  }, [direction]);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      if (speed === 'fast') {
        containerRef.current.style.setProperty('--animation-duration', '1s');
      } else if (speed === 'medium') {
        containerRef.current.style.setProperty('--animation-duration', '40s');
      } else {
        containerRef.current.style.setProperty('--animation-duration', '80s');
      }
    }
  }, [speed]);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }, [getDirection, getSpeed]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);

  return (
    <div
      ref={containerRef}
      className={cn('scroller relative z-20 mx-auto max-w-7xl overflow-hidden', className)}
    >
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[100px] bg-gradient-to-r from-gray-50 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-[100px] bg-gradient-to-l from-gray-50 to-transparent" />

      <ul
        ref={scrollerRef}
        className={cn(
          'flex min-w-full shrink-0 gap-4 py-4',
          start && 'animate-scroll',
          pauseOnHover && 'hover:[animation-play-state:paused]'
        )}
      >
        {items.map((item) => (
          <li
            className="relative h-[250px] w-[350px] max-w-full flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
            key={item.id}
          >
            <div className="relative z-20 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 truncate text-lg font-semibold text-gray-900">
                  {item.name}
                  <a
                    href={item.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex flex-shrink-0 items-center gap-1 text-gray-500 hover:text-gray-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaGithub className="h-4 w-4" />
                  </a>
                </h3>
                {item.language && <p className="text-sm text-gray-500">{item.language}</p>}
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-sm font-medium">{item.stars}</span>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-gray-600">{item.description}</p>
            {item.categories && item.categories.length > 0 && (
              <div className="absolute bottom-6 left-6 right-6 mt-4 flex flex-wrap gap-2">
                {item.categories.map((category, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                  >
                    # {category}
                  </span>
                ))}
              </div>
            )}
            <Link href={`/${type}/${item.slug}`} className="absolute inset-0 z-10"></Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfiniteMovingCards;
