import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Wish } from "@/lib/types";
import WishExperience from "@/components/wish/WishExperience";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: wish } = await supabase
    .from("wishes")
    .select("person_name, title")
    .eq("slug", slug)
    .single();

  if (!wish) return { title: "Wish Not Found" };

  return {
    title: `${wish.title} - A Special Wish for ${wish.person_name}`,
    description: `Someone created a special wish for ${wish.person_name}. Open it to experience the surprise!`,
    openGraph: {
      title: `${wish.title} - A Special Wish for ${wish.person_name}`,
      description: `Someone created a special wish for ${wish.person_name}. Open it to experience the surprise!`,
      type: "website",
    },
  };
}

export default async function WishPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: wish, error } = await supabase
    .from("wishes")
    .select("*, wish_media(*)")
    .eq("slug", slug)
    .single();

  if (error || !wish) {
    notFound();
  }

  return <WishExperience wish={wish as Wish} />;
}
