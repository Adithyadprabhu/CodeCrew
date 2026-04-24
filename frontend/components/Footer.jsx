import Link from 'next/link';

const links = [
  { href: '#', label: 'Sustainability Report' },
  { href: '#', label: 'Privacy Policy' },
  { href: '#', label: 'Marketplace Terms' },
];

/**
 * Footer component - Server component (no 'use client' needed)
 * Displays branding, copyright, and footer links
 */
export default function Footer() {
  return (
    <footer className="bg-beige border-t border-gray-200 mt-20 py-16 px-8">
      <div className="max-w-container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-primary-container font-bold italic text-xl flex items-center gap-2">
            <span className="material-symbols-outlined">eco</span>
            EcoCycle AI
          </span>
          <p className="text-gray-600 text-sm text-center md:text-left">
            © 2025 EcoCycle AI. Regenerative stewardship for a sustainable future.
          </p>
        </div>
        <div className="flex gap-8 flex-wrap justify-center">
          {links.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-gray-500 hover:text-primary text-sm transition-colors duration-300"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
