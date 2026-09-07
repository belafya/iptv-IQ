import React, { useState } from 'react';
import {
  Search,
  Star,
  Play,
  Radio,
  CheckCircle2,
  Tv,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { IPTVChannel, ViewLayout } from '../types';

interface ChannelListProps {
  channels: IPTVChannel[];
  currentChannelId: string;
  onSelectChannel: (channel: IPTVChannel) => void;
  favoriteIds: string[];
  onToggleFavorite: (id: string) => void;
  onlyWorking: boolean;
  onToggleOnlyWorking: () => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  currentChannelId,
  onSelectChannel,
  favoriteIds,
  onToggleFavorite,
  onlyWorking,
  onToggleOnlyWorking,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [viewLayout, setViewLayout] = useState<ViewLayout>('grid');
  const [visibleCount, setVisibleCount] = useState<number>(48);

  // Categories list (memoized/sanitized)
  const availableGroups: string[] = Array.from(
    new Set(channels.map((c) => (c.group ? c.group.trim() : 'عام')).filter(Boolean))
  ).slice(0, 30) as string[];
  const categories: string[] = ['الكل', 'المفضلة', ...availableGroups];



  // Reset pagination when filter or search changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setVisibleCount(48);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(48);
  };

  // Filtering
  const filteredChannels = channels.filter((channel) => {
    if (!channel) return false;

    // Verified / working filter
    if (onlyWorking && channel.status === 'offline') {
      return false;
    }

    // Search filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      const nameMatch = channel.name ? channel.name.toLowerCase().includes(query) : false;
      const groupMatch = channel.group ? channel.group.toLowerCase().includes(query) : false;
      if (!nameMatch && !groupMatch) return false;
    }

    // Category filter
    if (selectedCategory === 'المفضلة') {
      return favoriteIds.includes(channel.id);
    }
    if (selectedCategory !== 'الكل') {
      return channel.group === selectedCategory;
    }

    return true;
  });

  // Slice for high-performance rendering (prevents DOM freezing/crashes)
  const displayedChannels = filteredChannels.slice(0, visibleCount);
  const hasMore = visibleCount < filteredChannels.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 48, filteredChannels.length));
  };


  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-md p-4 sm:p-6 space-y-4">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="channel-search-input"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحث عن قناة (العراقية، السومرية، الجزيرة، دبي، القرآن...)"
            className="w-full bg-slate-50 border border-slate-200/80 focus:border-emerald-500 focus:bg-white rounded-2xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              مسح
            </button>
          )}
        </div>

        {/* View Layout & Verified Filter Controls */}
        <div className="flex items-center gap-2 justify-between sm:justify-end">
          
          {/* Working / Verified Toggle */}
          <button
            id="toggle-only-working-btn"
            onClick={onToggleOnlyWorking}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shadow-xs ${
              onlyWorking
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="إخفاء أي قناة غير شغالة وإظهار القنوات الفعالة فقط"
          >
            <ShieldCheck className={`w-4 h-4 ${onlyWorking ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>الشغالة فقط</span>
          </button>

          {/* Grid / List Layout Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض شبكي"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                viewLayout === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض قائمة"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              id={`cat-pill-${cat}`}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/70'
              }`}
            >
              {cat === 'المفضلة' && <Star className="w-3 h-3 inline-block ml-1 fill-amber-400 text-amber-400" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Channels Grid / List */}
      <div className="pt-2">
        {filteredChannels.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm space-y-2">
            <Tv className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">لم يتم العثور على قنوات تطابق البحث</p>
            <button
              onClick={() => { handleSearchChange(''); handleCategoryChange('الكل'); }}
              className="text-emerald-600 hover:underline text-xs font-bold"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : viewLayout === 'grid' ? (
          /* GRID VIEW */
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {displayedChannels.map((channel) => {
                const isPlaying = channel.id === currentChannelId;
                const isFav = favoriteIds.includes(channel.id);

                return (
                  <div
                    key={channel.id}
                    id={`channel-grid-card-${channel.id}`}
                    onClick={() => onSelectChannel(channel)}
                    className={`p-3.5 rounded-3xl border transition cursor-pointer flex flex-col justify-between gap-3 relative group ${
                      isPlaying
                        ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30 shadow-md'
                        : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/80'
                    }`}
                  >
                    {/* Top row: Logo and Favorite */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Tv className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(channel.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition cursor-pointer"
                        title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Channel Title & Group */}
                    <div>
                      <h3 className={`text-xs font-bold truncate ${isPlaying ? 'text-emerald-900 font-extrabold' : 'text-slate-900'}`}>
                        {channel.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-slate-500 font-medium truncate">{channel.group}</span>
                        {isPlaying ? (
                          <span className="text-emerald-600 font-black flex items-center gap-1">
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span>يعمل الآن</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>شغال</span>
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Progressive Load More & Count */}
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>عرض المزيد من القنوات (+48)</span>
                  <span className="text-slate-500 text-[10px] font-normal">
                    (يتم عرض {displayedChannels.length} من {filteredChannels.length})
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-2">
            {displayedChannels.map((channel) => {
              const isPlaying = channel.id === currentChannelId;
              const isFav = favoriteIds.includes(channel.id);

              return (
                <div
                  key={channel.id}
                  id={`channel-list-row-${channel.id}`}
                  onClick={() => onSelectChannel(channel)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    isPlaying
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20 shadow-xs'
                      : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <Tv className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-bold truncate ${isPlaying ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {channel.name}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{channel.group}</span>
                        {isPlaying && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            • مباشر
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(channel.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition cursor-pointer"
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>

                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isPlaying ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isPlaying ? <Radio className="w-3.5 h-3.5 animate-pulse" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                    </div>
                  </div>

                </div>
              );
            })}

            {/* Progressive Load More & Count */}
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <span>عرض المزيد من القنوات (+48)</span>
                  <span className="text-slate-500 text-[10px] font-normal">
                    (يتم عرض {displayedChannels.length} من {filteredChannels.length})
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};
