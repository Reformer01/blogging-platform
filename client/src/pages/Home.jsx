import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import API from '../store/authStore';
import {
  ArrowRight,
  PenNib,
  Lightning,
  ChartLineUp,
  Users,
  MagnifyingGlass,
  BookOpenText,
  Aperture,
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: PenNib,
    title: 'The Art of Drafting',
    description:
      'A serene, distraction-free environment tailored for deep work. Markdown support, seamless media embedding, and absolute focus.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?q=80&w=1000&auto=format&fit=crop',
  },
  {
    icon: ChartLineUp,
    title: 'Precision Analytics',
    description:
      'Understand your readership with elegance. Integrated analytics that track engagement without compromising visitor privacy.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
  },
  {
    icon: Lightning,
    title: 'Organic Reach',
    description:
      'Engineered for discoverability. Custom metadata, structured data, and uncompromising performance standards out of the box.',
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop',
  },
  {
    icon: Users,
    title: 'Cultivated Community',
    description:
      'Foster discourse that matters. Tools designed to build meaningful connections through threaded conversations and shared insights.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop',
  },
];

const CATEGORIES = [
  'Philosophy',
  'Architecture',
  'Literature',
  'Design',
  'Horology',
  'Economics',
  'Aesthetics',
  'Technology',
];

const PLACEHOLDER_ARTICLES = [
  {
    id: 'p1',
    slug: 'future-of-design',
    title: 'The Resonance of Form',
    excerpt: 'How minimalism evolved from an aesthetic choice to a psychological necessity in modern interfaces.',
    author: { username: 'Elena Rivera' },
    created_at: '2026-04-28T10:00:00Z',
    view_count: 3420,
    status: 'published',
  },
  {
    id: 'p2',
    slug: 'building-communities',
    title: 'Silent Architecture',
    excerpt: 'Structures that speak volumes by saying absolutely nothing.',
    author: { username: 'Marcus Webb' },
    created_at: '2026-04-25T08:30:00Z',
    view_count: 2180,
    status: 'published',
  },
  {
    id: 'p3',
    slug: 'minimalist-writing',
    title: 'The Weight of Words',
    excerpt: 'Stripping away excess to reveal the unadulterated truth of your narrative.',
    author: { username: 'Yuki Tanaka' },
    created_at: '2026-04-22T14:15:00Z',
    view_count: 1890,
    status: 'published',
  },
  {
    id: 'p4',
    slug: 'remote-creativity',
    title: 'Canvas of the Mind',
    excerpt: 'Cultivating original thought in an era of infinite replication.',
    author: { username: 'James Okafor' },
    created_at: '2026-04-20T09:00:00Z',
    view_count: 1540,
    status: 'published',
  },
  {
    id: 'p5',
    slug: 'open-source-impact',
    title: 'Collective Genius',
    excerpt: 'The unseen threads that bind the global repository of human knowledge.',
    author: { username: 'Priya Sharma' },
    created_at: '2026-04-18T11:30:00Z',
    view_count: 2750,
    status: 'published',
  },
  {
    id: 'p6',
    slug: 'analog-revival',
    title: 'The Analog Revival',
    excerpt: 'Why physical media is making a defiant return in our digital epoch.',
    author: { username: 'Thomas Vance' },
    created_at: '2026-04-15T09:20:00Z',
    view_count: 4120,
    status: 'published',
  }
];

/* -------------------------------------------------- */
/*  Marquee                                           */
/* -------------------------------------------------- */
function Marquee() {
  const items = [...CATEGORIES, ...CATEGORIES];
  return (
    <div className="marquee-track overflow-hidden py-8 border-y border-white/[0.04]">
      <div className="marquee-inner flex gap-16 whitespace-nowrap">
        {items.map((cat, i) => (
          <span
            key={i}
            className="text-sm font-sans font-medium tracking-[0.2em] uppercase text-warm-muted select-none flex items-center gap-4"
          >
            <Aperture size={14} weight="bold" className="text-gold/40" />
            {cat}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Text Reveal (GSAP scrub opacity)                  */
/* -------------------------------------------------- */
function TextReveal({ text }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      const words = ref.current.querySelectorAll('.reveal-word');
      gsap.set(words, { opacity: 0.1 });
      gsap.to(words, {
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 1,
        },
      });
    },
    { scope: ref }
  );

  return (
    <p
      ref={ref}
      className="text-[clamp(1.5rem,4vw,3.5rem)] font-serif leading-[1.15] tracking-tight text-cream max-w-[50rem] mx-auto text-center"
    >
      {text.split(' ').map((word, i) => (
        <span key={i} className="reveal-word inline-block mr-[0.25em]">
          {word}
        </span>
      ))}
    </p>
  );
}

/* -------------------------------------------------- */
/*  Feature Card (Sticky Scroll)                      */
/* -------------------------------------------------- */
function FeatureCard({ feature, index }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      gsap.from(ref.current, {
        y: 100,
        opacity: 0,
        scale: 0.95,
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 90%',
          end: 'top 60%',
          scrub: 1,
        },
      });
    },
    { scope: ref }
  );

  const Icon = feature.icon;

  return (
    <div ref={ref} className="group relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className={index % 2 === 1 ? 'md:order-2' : ''}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-gold/20 mb-8 bg-gold/5">
            <Icon size={24} weight="light" className="text-gold" />
          </div>
          <h3 className="text-3xl lg:text-4xl font-serif text-cream mb-5 tracking-tight">
            {feature.title}
          </h3>
          <p className="text-warm-gray text-lg leading-relaxed max-w-md font-sans">
            {feature.description}
          </p>
        </div>
        <div
          className={`relative overflow-hidden rounded-sm aspect-[4/5] bg-noir-800 ${
            index % 2 === 1 ? 'md:order-1' : ''
          }`}
        >
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full h-full object-cover grayscale-[40%] contrast-[1.1] brightness-[0.8] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-1000 ease-out"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================== */
/*  HOME PAGE                                         */
/* ================================================== */
function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/blog/posts', {
        params: { page, limit: 6, q: search }, // Fetch 6 to match bento grid precisely
      });
      setPosts(res.data.posts || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayArticles = posts.length > 0 ? posts : PLACEHOLDER_ARTICLES;

  useGSAP(
    () => {
      // Hero timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-title', { opacity: 0, y: 40, duration: 1.5, delay: 0.2 })
        .from('.hero-sub', { opacity: 0, y: 30, duration: 1.2 }, '-=1')
        .from('.hero-ctas', { opacity: 0, y: 20, duration: 1 }, '-=0.8');

      // Bento cards
      gsap.utils.toArray('.bento-card').forEach((card) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 60%',
            scrub: 1,
          },
        });
      });
      
      // Pinning the feature text
      ScrollTrigger.create({
        trigger: '.pinned-section',
        start: 'top 20%',
        end: 'bottom 80%',
        pin: '.pinned-content',
      });
    },
    { scope: containerRef }
  );

  /* Bento span helper - mathematically perfect for 4 cols */
  const getSpan = (i) => {
    switch (i) {
      case 0: return 'md:col-span-2 md:row-span-2';
      case 1: return 'md:col-span-1 md:row-span-2';
      case 2: return 'md:col-span-1 md:row-span-1';
      case 3: return 'md:col-span-1 md:row-span-1';
      case 4: return 'md:col-span-2 md:row-span-1';
      case 5: return 'md:col-span-2 md:row-span-1';
      default: return 'md:col-span-1 md:row-span-1';
    }
  };

  return (
    <main ref={containerRef} className="overflow-x-hidden w-full max-w-full bg-noir-900">
      {/* ======================== */}
      {/* ATTENTION : Hero         */}
      {/* ======================== */}
      <section className="relative min-h-[100dvh] w-full flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,169,110,0.06)_0%,rgba(10,10,10,0.95)_60%,rgba(5,5,5,1)_100%)] z-10" />
          <img
            src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover opacity-30 grayscale-[50%] mix-blend-luminosity"
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-6xl mx-auto flex flex-col items-center">
          <h1 className="hero-title text-display text-cream max-w-[64rem]">
            Cultivate Ideas That{' '}
            <span
              className="inline-block w-28 h-12 md:w-36 md:h-16 rounded-full align-middle bg-cover bg-center mx-2 border border-white/10 shadow-glass"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1455390582262-044cdead2708?q=80&w=400&auto=format&fit=crop)',
              }}
            />{' '}
            Defy Time.
          </h1>

          <p className="hero-sub text-warm-gray max-w-2xl mt-8 mb-12 font-sans text-lg md:text-xl">
            A sanctuary for profound thought. Elevate your writing in an environment designed for clarity, elegance, and enduring impact.
          </p>

          <div className="hero-ctas flex flex-col sm:flex-row gap-6">
            <Link
              to="/editor"
              className="inline-flex items-center justify-center gap-3 bg-gold hover:bg-gold-light text-noir-950 font-sans font-semibold px-8 py-4 rounded-sm text-base transition-colors duration-300"
            >
              Begin Writing
              <ArrowRight size={18} weight="bold" />
            </Link>
            <a
              href="#explore"
              className="inline-flex items-center justify-center gap-3 border border-white/10 hover:border-gold/50 text-cream font-sans font-medium px-8 py-4 rounded-sm text-base transition-colors duration-300 bg-white/5 backdrop-blur-sm"
            >
              Peruse the Archive
            </a>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* Marquee                  */}
      {/* ======================== */}
      <Marquee />

      {/* ======================== */}
      {/* Search                   */}
      {/* ======================== */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6">
          <div className="relative group">
            <MagnifyingGlass
              size={20}
              weight="bold"
              className="absolute left-6 top-1/2 -translate-y-1/2 text-warm-muted group-focus-within:text-gold transition-colors duration-300"
            />
            <input
              type="text"
              placeholder="Search the archive..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-noir-800/50 backdrop-blur-md text-cream pl-16 pr-6 py-5 rounded-full border border-white/[0.04] focus:border-gold/30 focus:outline-none transition-all duration-300 font-sans text-base placeholder:text-warm-muted shadow-glass"
            />
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* INTEREST : Bento Grid    */}
      {/* ======================== */}
      <section id="explore" className="py-16 md:py-32">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-serif text-cream mb-16 text-center">
            The Anthology
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(250px,1fr)]">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`bg-noir-800 rounded-sm animate-pulse ${getSpan(i)}`} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(250px,1fr)] grid-flow-dense">
              {displayArticles.slice(0, 6).map((article, i) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className={`bento-card group relative overflow-hidden bg-noir-800 border border-white/[0.03] hover:border-gold/20 transition-colors duration-700 ${getSpan(i)}`}
                >
                  <img
                    src={
                      article.featured_image ||
                      `https://images.unsplash.com/photo-${1455390582262 + i}?q=80&w=800&auto=format&fit=crop`
                    }
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[60%] contrast-125 mix-blend-screen group-hover:scale-105 group-hover:opacity-60 transition-all duration-1000 ease-out"
                    loading="lazy"
                    onError={(e) => {
                       e.target.src = 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=800&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-transparent" />

                  <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-8">
                    <h3
                      className={`font-serif text-cream mb-3 leading-tight ${
                        i === 0 ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-2xl md:text-3xl'
                      }`}
                    >
                      {article.title}
                    </h3>
                    {(i === 0 || i === 1 || i === 4) && article.excerpt && (
                      <p className="font-sans text-warm-gray text-base mb-5 max-w-lg line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs font-mono tracking-widest uppercase text-warm-muted mt-auto">
                      {article.author && <span className="text-gold">{article.author.username}</span>}
                      {article.view_count !== undefined && <span>{article.view_count.toLocaleString()} views</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {total > 0 && !loading && (
            <div className="flex justify-center items-center gap-8 mt-20 font-sans">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="text-warm-gray hover:text-gold uppercase tracking-widest text-xs font-semibold disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <span className="text-warm-muted text-sm font-mono">
                {page} / {Math.ceil(total / 6)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 6 >= total}
                className="text-warm-gray hover:text-gold uppercase tracking-widest text-xs font-semibold disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ======================== */}
      {/* DESIRE : GSAP Pinned Split */}
      {/* ======================== */}
      <section className="py-32 md:py-48 pinned-section bg-noir-950 relative border-t border-white/[0.02]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            <div className="pinned-content">
              <h2 className="text-4xl md:text-6xl font-serif text-cream leading-tight mb-8">
                An instrument for the refined mind.
              </h2>
              <p className="text-warm-gray text-xl leading-relaxed mb-10 font-sans max-w-md">
                We discarded the noise to build a platform that respects your words and your readers.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-3 text-gold font-sans font-medium uppercase tracking-widest text-sm hover:gap-5 transition-all duration-300"
              >
                Join the Vanguard
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="space-y-32 pt-16 lg:pt-0">
              {FEATURES.map((feature, i) => (
                <FeatureCard key={i} feature={feature} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================== */}
      {/* DESIRE : Scrub Text Reveal */}
      {/* ======================== */}
      <section className="py-40 md:py-64 px-6 bg-noir-900 border-t border-white/[0.02]">
        <TextReveal text="True elegance is found not in the abundance of features, but in the perfection of the essentials. Your words are the masterpiece; we are merely the gallery." />
      </section>

      {/* ======================== */}
      {/* ACTION : CTA             */}
      {/* ======================== */}
      <section className="py-40 md:py-56 relative overflow-hidden bg-noir-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-6xl font-serif text-cream mb-8">
            Write for eternity.
          </h2>
          <p className="text-warm-gray font-sans text-xl mb-14 max-w-xl mx-auto leading-relaxed">
            Commence your journey with a platform that values permanence over ephemerality.
          </p>
          <Link
            to="/editor"
            className="inline-flex items-center justify-center gap-3 bg-cream text-noir-950 font-sans font-semibold px-10 py-5 rounded-sm text-lg hover:bg-white transition-all duration-500 active:scale-[0.98]"
          >
            Commence Drafting
          </Link>
        </div>
      </section>

      {/* ======================== */}
      {/* Footer                   */}
      {/* ======================== */}
      <footer className="border-t border-white/[0.04] bg-noir-900">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-12 gap-10 lg:gap-16 mb-20">
            <div className="col-span-2 md:col-span-4">
              <Link to="/" className="text-2xl font-serif text-cream mb-6 block">
                BlogHub
              </Link>
              <p className="text-warm-gray font-sans text-sm leading-relaxed max-w-xs">
                The premier destination for profound essays, insightful analysis, and enduring literature.
              </p>
            </div>

            <div className="md:col-span-2 md:col-start-7">
              <h4 className="text-cream font-sans font-medium text-sm mb-6 uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4">
                <li><Link to="/editor" className="text-warm-gray hover:text-gold transition-colors font-sans text-sm">The Editor</Link></li>
                <li><a href="#explore" className="text-warm-gray hover:text-gold transition-colors font-sans text-sm">Anthology</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-cream font-sans font-medium text-sm mb-6 uppercase tracking-widest">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-warm-gray hover:text-gold transition-colors font-sans text-sm">Manifesto</a></li>
                <li><a href="#" className="text-warm-gray hover:text-gold transition-colors font-sans text-sm">Journal</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-cream font-sans font-medium text-sm mb-6 uppercase tracking-widest">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-warm-gray hover:text-gold transition-colors font-sans text-sm">Privacy</a></li>
                <li><a href="#" className="text-warm-gray hover:text-gold transition-colors font-sans text-sm">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-warm-muted font-sans text-xs uppercase tracking-widest">
              © 2026 BlogHub. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-warm-muted hover:text-gold transition-colors text-xs uppercase tracking-widest">Twitter</a>
              <a href="#" className="text-warm-muted hover:text-gold transition-colors text-xs uppercase tracking-widest">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Home;
