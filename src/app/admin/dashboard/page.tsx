"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWishStore } from "@/store/wishStore";
import WishCard from "@/components/admin/WishCard";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { wishes, isLoading, error, fetchWishes, deleteWish } = useWishStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    await deleteWish(deleteId);
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Wishes</h1>
          <p className="text-gray-400 text-sm mt-1">
            {wishes.length} wish{wishes.length !== 1 ? "es" : ""} created
          </p>
        </div>
        <Button onClick={() => router.push("/admin/create")} size="lg">
          ✨ Create New Wish
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && wishes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="text-6xl mb-4">🎁</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No wishes yet
          </h2>
          <p className="text-gray-400 mb-6">
            Create your first personalized wish!
          </p>
          <Button onClick={() => router.push("/admin/create")} size="lg">
            ✨ Create Your First Wish
          </Button>
        </motion.div>
      )}

      {/* Wishes Grid */}
      {!isLoading && wishes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishes.map((wish, index) => (
            <motion.div
              key={wish.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WishCard
                wish={wish}
                onEdit={(id) => router.push(`/admin/edit/${id}`)}
                onDelete={(id) => setDeleteId(id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Wish"
      >
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete this wish? This action cannot be
          undone and will also remove all associated media.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
