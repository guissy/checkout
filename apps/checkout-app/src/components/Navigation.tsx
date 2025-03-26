'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <nav className="bg-white shadow-sm mb-4">
      <div className="container mx-auto px-4 py-3">
        <ul className="flex flex-wrap gap-4 text-sm md:text-base">
          <li>
            <Link 
              href="/checkout"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/checkout') 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'hover:bg-gray-100'
              }`}
            >
              支付页面
            </Link>
          </li>
          <li>
            <Link 
              href="/excalidraw-flowchart"
              className={`px-3 py-2 rounded-md transition-colors ${
                isActive('/excalidraw-flowchart') 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'hover:bg-gray-100'
              }`}
            >
              Excalidraw 流程图
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
} 