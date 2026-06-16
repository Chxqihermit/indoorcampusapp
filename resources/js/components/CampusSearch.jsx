import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Clock,
  MapPin,
  Building2,
  Utensils,
  Car,
  CreditCard,
  Home,
  Navigation,
  ArrowLeftRight,
  Circle,
  UserRound
} from "lucide-react";
import {
  getRecentSearches,
  saveRecentSearch,
  searchAll,
  getCategoryResults,
  QUICK_CATEGORIES,
  SEARCH_SCOPE_OPTIONS
} from "@/utils/campusSearch";
function ResultIcon({ type }) {
  const cls = "w-5 h-5 text-gray-500 shrink-0";
  switch (type) {
    case "recent":
      return <Clock className={cls} />;
    case "staff":
      return <UserRound className={cls} />;
    case "restaurant":
      return <Utensils className={cls} />;
    case "parking":
      return <Car className={cls} />;
    case "atm":
      return <CreditCard className={cls} />;
    case "indoor":
      return <Building2 className={cls} />;
    default:
      return <MapPin className={cls} />;
  }
}
function CampusSearch({ mapRef, startLabel = "", endLabel = "", sidebarOpen = false }) {
  const [mode, setMode] = useState("place");
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState(startLabel);
  const [destination, setDestination] = useState(endLabel);
  const [results, setResults] = useState([]);
  const [recents, setRecents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeField, setActiveField] = useState("search");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searchScope, setSearchScope] = useState("all");
  const [activeCategory, setActiveCategory] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(void 0);
  useEffect(() => {
    setOrigin(startLabel);
  }, [startLabel]);
  useEffect(() => {
    setDestination(endLabel);
  }, [endLabel]);
  const activeQuery = mode === "directions" ? activeField === "origin" ? origin : activeField === "destination" ? destination : query : query;
  const displayItems = activeQuery.trim() ? results : activeCategory !== null ? getCategoryResults(activeCategory) : recents;
  const showDropdown = isOpen && (displayItems.length > 0 || !activeQuery.trim() && recents.length > 0);
  const runSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const found = await searchAll(q, searchScope);
    setResults(found);
    setLoading(false);
    setHighlightIndex(found.length > 0 ? 0 : -1);
  }, [searchScope]);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = mode === "directions" ? activeField === "origin" ? origin : destination : query;
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, origin, destination, mode, activeField, runSearch]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSelect = (result) => {
    saveRecentSearch(result);
    setRecents(getRecentSearches());
    setIsOpen(false);
    setQuery("");
    setActiveCategory(null);
    const map = mapRef.current;
    if (!map) return;
    if (result.type === "indoor") {
      window.location.href = `/indoor-map?location=${result.indoorId}`;
      return;
    }
    if (!result.coordinates) return;
    const [lng, lat] = result.coordinates;
    if (mode === "directions") {
      if (activeField === "origin") {
        map.setStart(lng, lat, result.name);
        setOrigin(result.name);
      } else {
        map.setEnd(lng, lat, result.name);
        setDestination(result.name);
      }
    } else {
      map.flyTo(lng, lat);
      const label = result.type === "staff" && result.roomNo
        ? `${result.name} (Room ${result.roomNo})`
        : result.name;
      map.setEnd(lng, lat, label);
      setDestination(label);
    }
  };
  const handleFocus = (field) => {
    setActiveField(field);
    setIsOpen(true);
    if (!query.trim()) setRecents(getRecentSearches());
  };
  const handleKeyDown = (e) => {
    const items = displayItems;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && items[highlightIndex]) {
        handleSelect(items[highlightIndex]);
      } else if (activeQuery.trim() && mapRef.current) {
        const which = mode === "directions" && activeField === "origin" ? "start" : "end";
        mapRef.current.geocodeAndSet(which, activeQuery);
        if (which === "start") setOrigin(activeQuery);
        else setDestination(activeQuery);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };
  const swapDirections = () => {
    const map = mapRef.current;
    if (!map) return;
    map.swapPoints();
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };
  const clearDirections = () => {
    mapRef.current?.clearRoute();
    setOrigin("");
    setDestination("");
    setMode("place");
  };
  const openDirections = () => {
    setMode("directions");
    setActiveField("destination");
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  return <div
    ref={containerRef}
    className={`campus-search-container ${sidebarOpen ? "campus-search-container--sidebar-open" : ""}`}
  >
            {mode === "place" ? <div className="campus-search-bar">
                    <Search className="w-5 h-5 text-gray-500 shrink-0 ml-1" />
                    <input
    ref={inputRef}
    type="text"
    value={query}
    onChange={(e) => {
      setQuery(e.target.value);
      setActiveCategory(null);
      setIsOpen(true);
    }}
    onFocus={() => handleFocus("search")}
    onKeyDown={handleKeyDown}
    placeholder="Search CampusNav"
    className="campus-search-input"
    autoComplete="off"
  />
                    {query && <button
    type="button"
    onClick={() => {
      setQuery("");
      setResults([]);
    }}
    className="p-1 rounded-full hover:bg-gray-100"
  >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>}
                    <button
    type="button"
    onClick={openDirections}
    className="campus-directions-btn"
    title="Directions"
  >
                        <Navigation className="w-5 h-5" />
                    </button>
                </div> : <div className="campus-directions-panel">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                        <button
    type="button"
    onClick={() => setMode("place")}
    className="p-1 rounded-full hover:bg-gray-100"
  >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                        <span className="text-sm font-medium text-gray-700">Directions</span>
                    </div>
                    <div className="flex gap-2 p-2">
                        <div className="flex flex-col items-center pt-3 gap-1">
                            <Circle className="w-3 h-3 text-blue-500 fill-blue-500" />
                            <div className="w-0.5 flex-1 bg-gray-300" />
                            <MapPin className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <input
    type="text"
    value={origin}
    onChange={(e) => setOrigin(e.target.value)}
    onFocus={() => handleFocus("origin")}
    onKeyDown={handleKeyDown}
    placeholder="Choose starting point"
    className="campus-directions-input"
  />
                            <input
    ref={inputRef}
    type="text"
    value={destination}
    onChange={(e) => setDestination(e.target.value)}
    onFocus={() => handleFocus("destination")}
    onKeyDown={handleKeyDown}
    placeholder="Choose destination"
    className="campus-directions-input"
  />
                        </div>
                        <div className="flex flex-col gap-1 pt-1">
                            <button
    type="button"
    onClick={swapDirections}
    className="p-2 rounded-full hover:bg-gray-100"
    title="Swap"
  >
                                <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
    type="button"
    onClick={clearDirections}
    className="p-2 rounded-full hover:bg-gray-100"
    title="Clear"
  >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    <button
    type="button"
    onClick={() => mapRef.current?.useGpsLocation()}
    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full"
  >
                        <Navigation className="w-4 h-4" />
                        Use my current location
                    </button>
                </div>}

            {mode === "place" && <div className="campus-search-scope">
                    {SEARCH_SCOPE_OPTIONS.map((option) => <button
    key={option.id}
    type="button"
    onClick={() => {
      setSearchScope(option.id);
      if (query.trim()) runSearch(query);
    }}
    className={`campus-search-scope-btn ${searchScope === option.id ? "campus-search-scope-btn-active" : ""}`}
  >
                            {option.label}
                        </button>)}
                </div>}

            {
    /* Category pills */
  }
            {mode === "place" && !isOpen && <div className="campus-category-pills">
                    {QUICK_CATEGORIES.map((cat, i) => <button
    key={cat.label}
    type="button"
    onClick={() => {
      setActiveCategory(i);
      setIsOpen(true);
      setQuery("");
    }}
    className="campus-category-pill"
  >
                            {cat.icon === "building" && <Building2 className="w-3.5 h-3.5" />}
                            {cat.icon === "restaurant" && <Utensils className="w-3.5 h-3.5" />}
                            {cat.icon === "parking" && <Car className="w-3.5 h-3.5" />}
                            {cat.icon === "atm" && <CreditCard className="w-3.5 h-3.5" />}
                            {cat.icon === "hostel" && <Home className="w-3.5 h-3.5" />}
                            {cat.label}
                        </button>)}
                </div>}

            {
    /* Dropdown */
  }
            {showDropdown && <div className="campus-search-dropdown">
                    {loading && <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>}
                    {!loading && displayItems.map((item, i) => <button
    key={item.id}
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => handleSelect(item)}
    className={`campus-search-result ${i === highlightIndex ? "campus-search-result-active" : ""}`}
  >
                            <ResultIcon type={item.type} />
                            <div className="flex-1 min-w-0 text-left">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {item.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {item.subtitle}
                                </div>
                            </div>
                        </button>)}
                    {!activeQuery.trim() && recents.length > 0 && activeCategory === null && <div className="px-4 py-2 text-xs text-blue-600 border-t border-gray-100">
                            Recent searches
                        </div>}
                </div>}
        </div>;
}
export {
  CampusSearch as default
};
