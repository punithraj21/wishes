import { create } from "zustand";
import { Wish } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface WishState {
  wishes: Wish[];
  currentWish: Wish | null;
  isLoading: boolean;
  error: string | null;

  fetchWishes: () => Promise<void>;
  fetchWishById: (id: string) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearCurrent: () => void;
}

export const useWishStore = create<WishState>((set) => ({
  wishes: [],
  currentWish: null,
  isLoading: false,
  error: null,

  fetchWishes: async () => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("wishes")
        .select("*, wish_media(*)")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ wishes: data || [], isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchWishById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("wishes")
        .select("*, wish_media(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      set({ currentWish: data, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  deleteWish: async (id: string) => {
    try {
      const supabase = createClient();

      // First delete media files from storage
      const { data: media } = await supabase
        .from("wish_media")
        .select("file_url")
        .eq("wish_id", id);

      if (media && media.length > 0) {
        const filePaths = media
          .map((m) => {
            const url = new URL(m.file_url);
            const pathParts = url.pathname.split(
              "/storage/v1/object/public/wishes/",
            );
            return pathParts[1] || "";
          })
          .filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage.from("wishes").remove(filePaths);
        }
      }

      const { error } = await supabase.from("wishes").delete().eq("id", id);
      if (error) throw error;

      set((state) => ({
        wishes: state.wishes.filter((w) => w.id !== id),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setError: (error) => set({ error }),
  clearCurrent: () => set({ currentWish: null }),
}));
