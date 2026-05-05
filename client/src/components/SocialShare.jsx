import React from 'react';
import { Share2, Facebook, Linkedin } from 'lucide-react';

function SocialShare({ title, slug, excerpt }) {
  const url = `${window.location.origin}/blog/${slug}`;

  const shareLinks = [
    {
      name: 'Twitter',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Facebook',
      icon: 'f',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      icon: 'in',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Copy',
      icon: '📋',
      action: () => {
        navigator.clipboard.writeText(url);
        alert('Link copied!');
      },
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-slate-400 text-sm flex items-center gap-2">
        <Share2 className="w-4 h-4" /> Share
      </span>
      <div className="flex gap-2">
        {shareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => link.action ? link.action() : window.open(link.url, '_blank')}
            title={link.name}
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-sm font-bold transition"
          >
            {link.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SocialShare;
