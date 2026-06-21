"use client";

import Link from 'next/link';

type WeddingType = 'religious' | 'traditional';

interface WeddingTypeSelectorProps {
  currentType: WeddingType;
}

export default function WeddingTypeSelector({ currentType }: WeddingTypeSelectorProps) {
  const bgColor = currentType === 'traditional' ? 'bg-amber-50' : 'bg-rose-50';
  const borderColor = currentType === 'traditional' ? 'border-green-600' : 'border-rose-200';

  return (
    <div className={`sticky top-0 z-40 border-b-2 ${bgColor} ${borderColor}`}>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className={`flex-1 rounded-lg py-2 px-4 text-center font-semibold transition-all ${
              currentType === 'religious'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white text-rose-700 border border-rose-300 hover:bg-rose-50'
            }`}
          >
            Mariage Religieux
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/traditional"
            className={`flex-1 rounded-lg py-2 px-4 text-center font-semibold transition-all ${
              currentType === 'traditional'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-green-700 border border-green-300 hover:bg-green-50'
            }`}
          >
            Mariage Traditionnel
          </Link>
        </div>
      </div>
    </div>
  );
}
