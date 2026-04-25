"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MediaItem, ThemeKey, Wish } from "@/lib/types";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import RichTextEditor from "./RichTextEditor";
import ImageUploader from "./ImageUploader";
import AudioUploader from "./AudioUploader";
import ThemeSelector from "./ThemeSelector";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils";
import { useRouter } from "next/navigation";

const wishSchema = z.object({
  person_name: z.string().min(1, "Person name is required"),
  title: z.string().min(1, "Title is required"),
  special_date: z.string().optional(),
});

type FormValues = z.infer<typeof wishSchema>;

interface WishFormProps {
  mode: "create" | "edit";
  initialData?: Wish;
}

export default function WishForm({ mode, initialData }: WishFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<MediaItem[]>(() => {
    if (!initialData?.wish_media) return [];
    return initialData.wish_media
      .filter((m) => m.type === "image")
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => ({
        kind: "existing" as const,
        id: m.id,
        mediaId: m.id,
        url: m.file_url,
      }));
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [message, setMessage] = useState(initialData?.message || "");
  const [theme, setTheme] = useState<ThemeKey>(initialData?.theme || "cartoon");
  const [existingAudio] = useState<string | null>(
    initialData?.wish_media?.find((m) => m.type === "audio")?.file_url || null,
  );
  const [removedExistingAudio, setRemovedExistingAudio] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(wishSchema),
    defaultValues: {
      person_name: initialData?.person_name || "",
      title: initialData?.title || "",
      special_date: initialData?.special_date || "",
    },
  });

  const persistMedia = async (wishId: string) => {
    const supabase = createClient();

    // Delete existing media records that were removed from items (edit mode)
    if (mode === "edit" && initialData?.wish_media) {
      const remainingMediaIds = items
        .filter((i) => i.kind === "existing")
        .map((i) => (i.kind === "existing" ? i.mediaId : ""));
      const removed = initialData.wish_media.filter(
        (m) => m.type === "image" && !remainingMediaIds.includes(m.id),
      );
      for (const media of removed) {
        const { error } = await supabase
          .from("wish_media")
          .delete()
          .eq("id", media.id);
        if (error) throw error;
      }
    }

    // Process items in their current order — order_index = position
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "existing") {
        const { error } = await supabase
          .from("wish_media")
          .update({ order_index: i })
          .eq("id", item.mediaId);
        if (error) throw error;
      } else {
        const ext = item.file.name.split(".").pop();
        const path = `${wishId}/images/${Date.now()}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("wishes")
          .upload(path, item.file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("wishes")
          .getPublicUrl(path);
        const { error: insertError } = await supabase
          .from("wish_media")
          .insert({
            wish_id: wishId,
            type: "image",
            file_url: urlData.publicUrl,
            order_index: i,
          });
        if (insertError) throw insertError;
      }
    }

    // Audio: removed existing
    if (removedExistingAudio && initialData?.wish_media) {
      const audioMedia = initialData.wish_media.find(
        (m) => m.type === "audio",
      );
      if (audioMedia) {
        await supabase.from("wish_media").delete().eq("id", audioMedia.id);
      }
    }

    // Audio: new upload
    if (audioFile) {
      const ext = audioFile.name.split(".").pop();
      const path = `${wishId}/audio/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("wishes")
        .upload(path, audioFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("wishes")
        .getPublicUrl(path);
      const { error: insertError } = await supabase.from("wish_media").insert({
        wish_id: wishId,
        type: "audio",
        file_url: urlData.publicUrl,
        order_index: 0,
      });
      if (insertError) throw insertError;
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let wishId: string;

      if (mode === "create") {
        const slug = generateSlug(data.person_name);
        const { data: wish, error } = await supabase
          .from("wishes")
          .insert({
            slug,
            person_name: data.person_name,
            title: data.title,
            special_date: data.special_date || null,
            message,
            theme,
            created_by: user.id,
          })
          .select()
          .single();
        if (error) throw error;
        wishId = wish.id;
      } else if (initialData) {
        const { error } = await supabase
          .from("wishes")
          .update({
            person_name: data.person_name,
            title: data.title,
            special_date: data.special_date || null,
            message,
            theme,
          })
          .eq("id", initialData.id);
        if (error) throw error;
        wishId = initialData.id;
      } else {
        throw new Error("Missing initial data for edit");
      }

      await persistMedia(wishId);

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Basic Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm">
            1
          </span>
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Person Name *"
            placeholder="Who is this wish for?"
            id="person_name"
            error={errors.person_name?.message}
            {...register("person_name")}
          />
          <Input
            label="Title *"
            placeholder="e.g., Happy Birthday!"
            id="title"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>
        <Input
          label="Special Date"
          type="date"
          id="special_date"
          {...register("special_date")}
        />
      </section>

      {/* Message */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm">
            2
          </span>
          Your Message
        </h2>
        <RichTextEditor content={message} onChange={setMessage} />
      </section>

      {/* Images */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm">
            3
          </span>
          Memory Gallery
        </h2>
        <ImageUploader items={items} onChange={setItems} />
      </section>

      {/* Audio */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm">
            4
          </span>
          Audio Message
        </h2>
        <AudioUploader
          audioFile={audioFile}
          onChange={setAudioFile}
          existingUrl={removedExistingAudio ? null : existingAudio}
          onRemoveExisting={() => setRemovedExistingAudio(true)}
        />
      </section>

      {/* Theme */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-sm">
            5
          </span>
          Choose Theme
        </h2>
        <ThemeSelector selected={theme} onChange={setTheme} />
      </section>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} size="lg">
          {mode === "create" ? "🎁 Create Wish" : "💾 Save Changes"}
        </Button>
      </div>
    </form>
  );
}
