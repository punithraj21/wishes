import WishForm from "@/components/admin/WishForm";

export default function CreateWishPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Create New Wish</h1>
        <p className="text-gray-400 text-sm mt-1">
          Fill in the details to create a personalized wish experience
        </p>
      </div>
      <WishForm mode="create" />
    </div>
  );
}
