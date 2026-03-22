import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Plus, 
  Search, 
  X, 
  Star, 
  Check,
  ChevronRight,
  ChevronLeft,
  Facebook,
  Twitter,
  Instagram,
  Bell,
  Menu
} from 'lucide-react';

// Configuración de APIs
const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = "19b71799f6e4c284e57d1317d1e1fa38";
const JIKAN_API_BASE = "https://api.jikan.moe/v4";
const TVMAZE_API_BASE = "https://api.tvmaze.com";

const App = () => {
  const [content, setContent] = useState({
    movies: [],
    anime: [],
    series: [],
    trending: []
  });
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // home, series, movies, anime, mylist
  const [activeGenre, setActiveGenre] = useState('All');
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const genres = ["All", "Action", "Comedy", "Drama", "Fantasy", "Horror", "Anime", "Sci-Fi"];

  // Component code with styles moved to index.css
  // Función de normalización mejorada
  const normalizeData = (item, type) => {
    if (!item) return null;
    
    const getMockGenres = (title, overview) => {
      const text = ((title || "") + (overview || "")).toLowerCase();
      let res = ["Drama"];
      if (text.includes("fight") || text.includes("war") || text.includes("action") || text.includes("combat")) res.push("Action");
      if (text.includes("laugh") || text.includes("funny") || text.includes("comedy") || text.includes("school")) res.push("Comedy");
      if (text.includes("magic") || text.includes("dragon") || text.includes("fantasy") || text.includes("demon")) res.push("Fantasy");
      if (text.includes("scary") || text.includes("dead") || text.includes("horror") || text.includes("ghost")) res.push("Horror");
      if (text.includes("space") || text.includes("future") || text.includes("sci-fi") || text.includes("robot")) res.push("Sci-Fi");
      return res;
    };

    try {
      switch (type) {
        case 'tmdb':
          return {
            id: `tmdb-${item.id}`,
            title: item.title || item.name || 'Sin título',
            image: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500',
            overview: item.overview || 'Sin descripción disponible.',
            rating: item.vote_average ? Math.round(item.vote_average / 2) : 4,
            year: (item.release_date || item.first_air_date || '').split('-')[0] || '2023',
            source: 'TMDB',
            category: item.title ? 'Movie' : 'Series',
            genres: getMockGenres(item.title || item.name || "", item.overview || "")
          };
        case 'jikan':
          return {
            id: `jikan-${item.mal_id}`,
            title: item.title_english || item.title || 'Anime sin título',
            image: item.images?.jpg?.large_image_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
            poster: item.images?.jpg?.image_url || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500',
            overview: item.synopsis || 'Sin sinopsis disponible.',
            rating: item.score ? Math.round(item.score / 2) : 4,
            year: item.year || (item.aired?.from || '').split('-')[0] || 'N/A',
            source: 'MyAnimeList',
            category: 'Anime',
            genres: ["Anime", ...getMockGenres(item.title || "", item.synopsis || "")]
          };
        case 'tvmaze':
          const cleanSummary = item.summary?.replace(/<[^>]*>?/gm, '') || '';
          return {
            id: `tvmaze-${item.id}`,
            title: item.name || 'Serie sin título',
            image: item.image?.original || item.image?.medium || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000',
            poster: item.image?.medium || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500',
            overview: cleanSummary || 'Sin descripción disponible.',
            rating: item.rating?.average ? Math.round(item.rating.average / 2) : 4,
            year: (item.premiered || '').split('-')[0] || 'N/A',
            source: 'TVMaze',
            category: 'Series',
            genres: ["Series", ...getMockGenres(item.name || "", cleanSummary)]
          };
        default: return item;
      }
    } catch (e) { 
      console.error("Error al normalizar item:", e);
      return null; 
    }
  };

  const fetchMassiveData = useCallback(async () => {
    setLoading(true);
    try {
      const moviePromises = [1, 2].map(page => 
        fetch(`${TMDB_API_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`)
          .then(r => r.ok ? r.json() : { results: [] })
          .catch(() => ({ results: [] }))
      );
      
      const animePromises = [1, 2].map(page => 
        fetch(`${JIKAN_API_BASE}/top/anime?page=${page}`)
          .then(r => r.ok ? r.json() : { data: [] })
          .catch(() => ({ data: [] }))
      );

      const seriesPromise = fetch(`${TVMAZE_API_BASE}/shows`)
        .then(r => r.ok ? r.json() : [])
        .catch(() => []);

      const [movieResults, animeResults, seriesRes] = await Promise.all([
        Promise.all(moviePromises),
        Promise.all(animePromises),
        seriesPromise
      ]);

      const allMovies = movieResults
        .flatMap(res => res?.results || [])
        .map(i => normalizeData(i, 'tmdb'))
        .filter(Boolean);

      const allAnime = animeResults
        .flatMap(res => res?.data || [])
        .map(i => normalizeData(i, 'jikan'))
        .filter(Boolean);

      const allSeries = (Array.isArray(seriesRes) ? seriesRes : [])
        .slice(0, 80)
        .map(i => normalizeData(i, 'tvmaze'))
        .filter(Boolean);

      setContent({
        movies: allMovies,
        anime: allAnime,
        series: allSeries,
        trending: allMovies.slice(0, 15)
      });
    } catch (error) {
      console.error("Error crítico al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMassiveData(); }, [fetchMassiveData]);

  const toggleMyList = (item) => {
    if (!item) return;
    setMyList(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [item, ...prev]);
  };

  const filteredContent = useMemo(() => {
    let base = [];
    if (activeTab === 'home') return content; 
    if (activeTab === 'movies') base = content.movies;
    if (activeTab === 'series') base = content.series;
    if (activeTab === 'anime') base = content.anime;
    if (activeTab === 'mylist') base = myList;

    if (activeGenre === 'All') return base;
    return base.filter(item => item.genres?.includes(activeGenre));
  }, [activeTab, activeGenre, content, myList]);

  const featuredList = (content.trending || []).slice(0, 5);
  const currentHero = featuredList[heroIndex];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#ffb400] font-bold uppercase tracking-widest gap-6 text-center p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1),transparent_50%)] animate-pulse" />
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/10 border-t-yellow-500 rounded-full animate-spin shadow-[0_0_30px_rgba(234,179,8,0.3)]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-4 h-4 fill-yellow-500 animate-pulse" />
        </div>
      </div>
      <p className="text-xs text-gray-400 font-black animate-pulse z-10 tracking-[5px]">Synchronizing API Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#ffb400]/30 selection:text-[#ffb400] overflow-x-hidden scroll-smooth relative">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 lg:px-16 py-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent`}>
        <div className="flex items-center gap-10 lg:gap-16">
          <h1 
            onClick={() => { setActiveTab('home'); setActiveGenre('All'); }}
            className="text-[#ffb400] text-3xl font-serif font-black cursor-pointer transition-transform hover:scale-105"
          >
            Movie love
          </h1>
          
          <Menu className="lg:hidden w-6 h-6 cursor-pointer text-white" onClick={() => setIsMenuOpen(!isMenuOpen)} />

          <ul className={`fixed lg:relative top-0 left-0 w-2/3 lg:w-auto h-screen lg:h-auto bg-black/95 lg:bg-transparent flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 p-10 lg:p-0 text-[13px] font-medium text-white/70 transition-transform duration-300 lg:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <X className="lg:hidden self-end mb-8 cursor-pointer text-white hover:text-red-500" onClick={() => setIsMenuOpen(false)} />
            <NavItem label="Home" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setActiveGenre('All'); setIsMenuOpen(false); }} />
            <NavItem label="TV Series" active={activeTab === 'series'} onClick={() => { setActiveTab('series'); setActiveGenre('All'); setIsMenuOpen(false); }} />
            <NavItem label="Movie" active={activeTab === 'movies'} onClick={() => { setActiveTab('movies'); setActiveGenre('All'); setIsMenuOpen(false); }} />
            <NavItem label="Top Most" active={activeTab === 'anime'} onClick={() => { setActiveTab('anime'); setActiveGenre('All'); setIsMenuOpen(false); }} />
          </ul>
        </div>
        <div className="flex items-center gap-6 hidden lg:flex">
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all cursor-text w-64">
            <Search className="w-4 h-4 text-white/60" />
            <input type="text" placeholder="Search Movies..." className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-white/60" />
          </div>
          <div className="relative cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeTab === 'home' && currentHero && (
        <header className="relative h-[85vh] lg:h-[95vh] w-full bg-[#000000] overflow-hidden">
          <img 
            key={currentHero.id}
            src={currentHero.image} 
            className="absolute inset-0 w-full h-full object-cover opacity-90" 
            alt="featured"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-10" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
          
          <div className="absolute bottom-24 left-6 lg:left-16 max-w-2xl z-30">
            <h2 className="text-4xl lg:text-6xl font-black mb-3 uppercase tracking-tight leading-[1.1] text-white">
              {currentHero.title}
            </h2>
            <div className="flex items-center gap-3 text-white/80 text-[13px] font-medium mb-3">
              <span>Released in {currentHero.year}</span>
              <span className="w-1 h-1 rounded-full bg-white/50"></span>
              <span>1 h 54 min</span>
              <span className="w-1 h-1 rounded-full bg-white/50"></span>
              <span>{currentHero.genres?.slice(0, 3).join(', ')}</span>
            </div>
            <p className="text-white/70 text-[13px] leading-relaxed mb-6 max-w-xl pr-4">
              {currentHero.overview}
            </p>
            <div className="flex items-center gap-2 mb-8">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < currentHero.rating ? 'text-[#ffb400] fill-[#ffb400]' : 'text-gray-600 fill-gray-600'}`} />
                ))}
              </div>
              <span className="ml-2 text-white/50 text-xs">16k Viewers</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-[#1877F2] hover:bg-blue-600 text-white px-10 py-3 rounded-full font-bold text-[13px] transition-colors flex items-center gap-2">
                 Play
              </button>
              <button 
                onClick={() => toggleMyList(currentHero)}
                className="flex items-center justify-center w-11 h-11 border border-white/30 rounded-full hover:border-white transition-colors"
              >
                {myList.some(i => i.id === currentHero.id) ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Filtros de Género */}
      <div className={`px-6 lg:px-16 py-8 relative z-40 bg-black`}>
        <div className="flex justify-center gap-4 lg:gap-6 overflow-x-auto no-scrollbar items-center border-b border-t border-white/10 py-6">
          {genres.map(genre => (
            <button 
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-8 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${activeGenre === genre ? 'bg-[#ffb400] text-black border-transparent' : 'bg-transparent border border-white/30 text-white hover:border-[#ffb400] hover:text-[#ffb400]'}`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="px-6 lg:px-16 py-8 lg:py-16 space-y-24 min-h-[50vh] relative z-10 w-full max-w-[2000px] mx-auto">
        
        {activeTab === 'home' ? (
          <>
            <MovieRow title="Anime Essentials" items={filterByGenre(content.anime, activeGenre)} onSelect={setSelectedItem} />
            <MovieRow title="Most Viewed" items={filterByGenre(content.trending, activeGenre)} onSelect={setSelectedItem} />

            {content.movies[7] && activeGenre === 'All' && (
              <section className="relative w-screen -ml-6 lg:-ml-16 h-[500px] lg:h-[600px] overflow-hidden my-20 group">
                <img src={content.movies[7].image} className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[15s]" alt="special" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-transparent to-[#000000]" />
                <div className="absolute inset-y-0 left-6 lg:left-16 flex flex-col justify-center max-w-xl space-y-4 z-10 w-full lg:w-1/2">
                  <h3 className="text-4xl lg:text-5xl font-serif font-black uppercase text-white tracking-widest leading-[1.1] ">{content.movies[7].title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < content.movies[7].rating ? 'text-[#ffb400] fill-[#ffb400]' : 'text-gray-600'}`} />)}</div>
                    <span className="text-white/60 text-[11px]">84k Viewers</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-3 leading-relaxed mb-6">{content.movies[7].overview}</p>
                  <div className="flex items-center gap-4">
                    <button className="bg-[#1877F2] hover:bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold text-[13px] transition-colors flex items-center gap-2">Play</button>
                    <button onClick={() => toggleMyList(content.movies[7])} className="flex items-center justify-center w-10 h-10 border border-white/30 rounded-full hover:border-white transition-colors">
                      {myList.some(i => i.id === content.movies[7].id) ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <div className="py-12 mt-4 text-center">
               <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-wide">Popular TV Series</h2>
            </div>
            
            {content.series[0] && activeGenre === 'All' && (
              <section className="relative w-screen -ml-6 lg:-ml-16 h-[500px] lg:h-[600px] overflow-hidden group mb-16 opacity-90 border-t border-b border-white/5">
                <img src={content.series[0].image} className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[15s]" alt="flash" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#110505] via-[#110505]/90 to-[#110505]/30 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#110505]/50 to-[#000000] z-10" />
                
                <div className="absolute inset-y-0 left-6 lg:left-16 flex flex-col justify-center max-w-xl space-y-4 z-20 w-full lg:w-1/2">
                   <h3 className="text-4xl lg:text-5xl font-serif font-black uppercase text-white tracking-widest leading-[1.1] shadow-black drop-shadow-lg">{content.series[0].title}</h3>
                   <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < content.series[0].rating ? 'text-[#ffb400] fill-[#ffb400]' : 'text-gray-600'}`} />)}</div>
                    <span className="text-white/60 text-[11px]">View all</span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed mb-6 drop-shadow-md">{content.series[0].overview}</p>
                  <div className="flex items-center gap-4">
                    <button className="bg-[#1877F2] hover:bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold text-[13px] transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20">Play</button>
                    <button onClick={() => toggleMyList(content.series[0])} className="flex items-center justify-center w-10 h-10 border border-white/30 rounded-full hover:border-white transition-colors bg-black/20 backdrop-blur-sm">
                      {myList.some(i => i.id === content.series[0].id) ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                </div>
              </section>
            )}

            <MovieRow title="" items={filterByGenre(content.series, activeGenre).slice(1, 20)} onSelect={setSelectedItem} />
            <MovieRow title="New Movies" items={filterByGenre(content.movies, activeGenre).slice(10, 30)} onSelect={setSelectedItem} />
          </>
        ) : (
          <div className="space-y-10">
            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-widest text-white border-l-4 border-yellow-500 pl-4">
              {activeTab === 'mylist' ? 'My List' : activeTab}
            </h2>
            
            {filteredContent.length > 0 ? (
              <div className="flex flex-wrap gap-6 lg:gap-8">
                {filteredContent.map(item => <MovieCard key={item.id} item={item} onSelect={setSelectedItem} />)}
              </div>
            ) : (
              <div className="py-40 text-center space-y-6 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Search className="w-16 h-16 mx-auto text-gray-600 opacity-20" />
                <h3 className="text-xl font-bold text-gray-400">Sin resultados en esta categoría</h3>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative bg-[#000000] border-t border-white/5 pt-16 pb-12 px-6 lg:px-20 overflow-hidden mt-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-16">
            <h6 className="text-[#ffb400] text-3xl font-serif font-black">Movie love</h6>
            <div className="flex items-center gap-4 border-b border-[#ffb400]/20 pb-2">
               <span className="text-[#ffb400] font-bold text-[13px]">Follow Us on:</span>
               <a href="#" className="text-[#ffb400] hover:text-white transition-colors px-1"><Facebook className="w-4 h-4 fill-[#ffb400]" /></a>
               <a href="#" className="text-[#ffb400] hover:text-white transition-colors px-1"><Twitter className="w-4 h-4 fill-[#ffb400]" /></a>
               <a href="#" className="text-[#ffb400] hover:text-white transition-colors px-1"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10 w-full mx-auto">
            <FooterCol title="Movie" items={["Action", "Comedy", "Horror", "Adventures", "Fantasy"]} />
            <FooterCol title="Series" items={["Netflix Movies", "Classic Movies", "Valentine Day", "Comedy", "Fantasy"]} />
            <FooterCol title="Support" items={["Contact Us", "Privacy Policy", "Terms of services", "Help Center"]} />
            <div className="space-y-6">
               <h6 className="font-bold text-[#ffb400] mb-6 text-[15px]">Support</h6>
               <ul className="space-y-3 text-[12px] text-gray-500">
                  <li>support@movie.com.row</li>
                  <li>+1 (44) 124 3456</li>
               </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10 bg-black/90 backdrop-blur-xl animate-fade-in-up transition-all duration-300">
          <div className="relative bg-[#0a0a0a] w-full max-w-5xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden flex flex-col lg:flex-row h-[90vh] lg:h-[750px]">
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 z-[210] p-3 bg-black/60 hover:bg-red-500/80 hover:text-white backdrop-blur-md rounded-full text-gray-400 transition-all border border-white/10 hover:border-red-500 group">
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <div className="relative w-full lg:w-[45%] h-64 lg:h-full shrink-0">
              <img src={selectedItem.poster} className="w-full h-full object-cover hidden lg:block" alt="modal poster" />
              <img src={selectedItem.image} className="w-full h-full object-cover lg:hidden" alt="modal banner" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a] hidden lg:block" />
            </div>
            <div className="p-8 lg:p-14 flex-1 overflow-y-auto no-scrollbar relative flex flex-col pt-10 lg:pt-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest text-yellow-500">{selectedItem.category}</span>
                <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest text-gray-400">{selectedItem.year}</span>
              </div>
              <h3 className="text-4xl lg:text-6xl font-black uppercase mb-6 tracking-tighter leading-[1.05] text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">{selectedItem.title}</h3>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest mb-8 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-md border border-yellow-500/20">
                    <Star className="w-4 h-4 fill-yellow-500" /> {selectedItem.rating}.0 / 5
                  </div>
                  <span className="px-3 py-1.5 rounded-md border border-white/10 text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {selectedItem.source} API
                  </span>
                  {selectedItem.genres?.slice(0, 3).map(g => (
                    <span key={g} className="px-3 py-1.5 rounded-md border border-white/10 text-white/60">{g}</span>
                  ))}
               </div>
               <p className="text-sm lg:text-[15px] text-gray-300 leading-relaxed font-medium mb-12 flex-1">
                 {selectedItem.overview}
               </p>
               <div className="mt-auto flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10">
                 <button className="flex-1 bg-white hover:bg-yellow-500 text-black px-10 py-4 rounded-xl font-black text-[12px] tracking-[4px] flex justify-center items-center gap-3 transition-colors duration-300">
                    <Play className="w-4 h-4 fill-black" /> INITIALIZE STREAM
                 </button>
                 <button 
                  onClick={() => toggleMyList(selectedItem)}
                  className="sm:w-20 lg:w-24 bg-white/5 hover:bg-yellow-500 text-white hover:text-black border border-white/10 hover:border-yellow-500 flex items-center justify-center p-4 rounded-xl transition-colors duration-300"
                 >
                   {myList.some(i => i.id === selectedItem.id) ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes Reutilizables
const NavItem = ({ label, active, onClick }) => (
  <li onClick={onClick} className={`cursor-pointer transition-all duration-300 uppercase text-[10px] tracking-[3px] relative group flex items-center ${active ? 'text-yellow-500 font-extrabold' : 'text-gray-400 hover:text-white font-medium'}`}>
    {label}
    <span className={`absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300 ${active ? 'w-full shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'w-0 group-hover:w-1/2'}`}></span>
  </li>
);

const FooterCol = ({ title, items }) => (
  <div>
    <h6 className="font-bold text-[#ffb400] mb-6 text-[15px]">{title}</h6>
    <ul className="space-y-3 text-[12px] text-gray-500">
      {items.map(item => <li key={item} className="hover:text-white cursor-pointer transition-colors">{item}</li>)}
    </ul>
  </div>
);

const MovieCard = ({ item, onSelect }) => (
  <div onClick={() => onSelect(item)} className="group cursor-pointer w-[120px] lg:w-[150px] flex-none snap-start">
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-transparent transition-all duration-300 group-hover:border-white/20 group-hover:-translate-y-1">
      <img src={item.poster} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
         <div className="bg-[#1877F2] p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
           <Play className="w-4 h-4 fill-white text-white ml-0.5" />
         </div>
      </div>
    </div>
    <div className="space-y-0.5 px-1">
      <h4 className="text-[13px] font-bold text-white truncate group-hover:text-[#1877F2] transition-colors">{item.title}</h4>
      <div className="flex flex-col text-[11px] text-gray-500">
         <span className="truncate">{item.genres?.slice(0,2).join(', ')}</span>
         <span>{item.year}</span>
      </div>
    </div>
  </div>
);

const MovieRow = ({ title, items, onSelect }) => {
  const scrollRef = React.useRef(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-[18px] font-bold text-white">{title}</h3>
        <button className="text-[12px] text-gray-500 hover:text-white transition-colors flex items-center gap-1 group">
          View all <ChevronRight className="w-3 h-3 group-hover:translate-x-1 border border-gray-600 rounded-full p-0.5 transition-transform" />
        </button>
      </div>
      <div ref={scrollRef} className="flex gap-4 lg:gap-6 overflow-x-auto no-scrollbar pb-2 pt-2 snap-x">
        {items.map((item) => <MovieCard key={item.id} item={item} onSelect={onSelect} />)}
      </div>
    </div>
  );
};

const filterByGenre = (list, genre) => {
  if (!list) return [];
  if (genre === 'All') return list;
  return list.filter(item => item.genres?.includes(genre));
};

export default App;