"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useWishStore } from "@/store/wishStore";
import WishForm from "@/components/admin/WishForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function EditWishPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentWish, isLoading, error, fetchWishById, clearCurrent } =
    useWishStore();

  useEffect(() => {
    if (id) fetchWishById(id);
    return () => clearCurrent();
  }, [id, fetchWishById, clearCurrent]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!currentWish) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-gray-400">Wish not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Wish</h1>
        <p className="text-gray-400 text-sm mt-1">
          Modify the wish for{" "}
          <span className="text-violet-400">{currentWish.person_name}</span>
        </p>
      </div>
      <WishForm mode="edit" initialData={currentWish} />
    </div>
  );
}
