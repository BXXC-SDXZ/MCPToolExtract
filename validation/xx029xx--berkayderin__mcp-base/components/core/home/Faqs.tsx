'use client';

import React, { useState } from 'react';

import FaqItem from '@/components/core/home/FaqItem';

import { faqs } from '@/data/faqs';

import { TbLocationQuestion } from 'react-icons/tb';

const Faqs = () => {
  const [openIndexColumn1, setOpenIndexColumn1] = useState<number | null>(null);
  const [openIndexColumn2, setOpenIndexColumn2] = useState<number | null>(null);

  const column1 = faqs.slice(0, Math.ceil(faqs.length / 2));
  const column2 = faqs.slice(Math.ceil(faqs.length / 2));

  return (
    <section className="border-t border-slate-200 px-4 py-8 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center sm:mb-12">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-md border border-slate-200 bg-slate-50/50">
              <TbLocationQuestion className="h-6 w-6 text-slate-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Everything you need to know about MCP Servers and how they work
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-4">
            {column1.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                icon={faq.icon}
                isOpen={index === openIndexColumn1}
                onToggle={() => setOpenIndexColumn1(index === openIndexColumn1 ? null : index)}
              />
            ))}
          </div>
          <div className="space-y-4">
            {column2.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                icon={faq.icon}
                isOpen={index === openIndexColumn2}
                onToggle={() => setOpenIndexColumn2(index === openIndexColumn2 ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Faqs;
