import { create } from 'zustand';

// 우선 mock으로 처리 (API 미연동, 로컬 상태만 토글)
interface BookmarkState {
  bookmarkedIds: Set<string>;
  toggle: (id: string) => void;
}

export const useBookmarkStore = create<BookmarkState>((set) => ({
  bookmarkedIds: new Set<string>(),
  toggle: (id) =>
    set((state) => {
      const next = new Set(state.bookmarkedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { bookmarkedIds: next };
    }),
}));

export const useIsBookmarked = (id: string) =>
  useBookmarkStore((s) => s.bookmarkedIds.has(id));
