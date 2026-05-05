import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../store/authStore';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';

function Search() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState('all');
  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, searchType]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await API.get('/search', {
        params: { q: query, type: searchType },
      });
      setResults(res.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLink = (result) => {
    if (result.type === 'post') return `/blog/${result.slug}`;
    if (result.type === 'tag') return `/tags/${result.slug}`;
    if (result.type === 'user') return `/author/${result.username}`;
    return '/';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Results</h1>

        <div className="mb-6 space-y-4">
          <p className="text-slate-400">Found {results.length} result(s) for "{query}"</p>

          {/* Filter buttons */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'posts', 'tags', 'users'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-4 py-2 rounded transition ${
                  searchType === type
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-slate-400">Searching...</div>
        ) : results.length === 0 ? (
          <div className="text-center text-slate-400">
            No results found. Try a different search term.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                to={getLink(result)}
                className="block bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 px-2 py-1 rounded text-xs font-semibold">
                        {result.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                    {result.excerpt && (
                      <p className="text-slate-400 text-sm line-clamp-2">{result.excerpt}</p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 ml-4 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
