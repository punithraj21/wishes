"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThemeKey, UploadedFile, Wish } from "@/lib/types";
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
  const [imageFiles, setImageFiles] = useState<UploadedFile[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [message, setMessage] = useState(initialData?.message || "");
  const [theme, setTheme] = useState<ThemeKey>(initialData?.theme || "cartoon");
  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.wish_media
      ?.filter((m) => m.type === "image")
      .map((m) => m.file_url) || [],
  );
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

  const uploadFiles = async (wishId: string) => {
    const supabase = createClient();
    const mediaRecords: {
      wish_id: string;
      type: string;
      file_url: string;
      order_index: number;
    }[] = [];

    // Upload new images
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i].file;
      const ext = file.name.split(".").pop();
      const path = `${wishId}/images/${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage
        .from("wishes")
        .upload(path, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("wishes")
        .getPublicUrl(path);
      mediaRecords.push({
        wish_id: wishId,
        type: "image",
        file_url: urlData.publicUrl,
        order_index: existingImages.length + i,
      });
    }

    // Upload audio
    if (audioFile) {
      const ext = audioFile.name.split(".").pop();
      const path = `${wishId}/audio/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("wishes")
        .upload(path, audioFile);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("wishes")
        .getPublicUrl(path);
      mediaRecords.push({
        wish_id: wishId,
        type: "audio",
        file_url: urlData.publicUrl,
        order_index: 0,
      });
    }

    if (mediaRecords.length > 0) {
      const { error } = await supabase.from("wish_media").insert(mediaRecords);
      if (error) throw error;
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();

      // Debug: check both session and user
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("Session:", sessionData.session ? "EXISTS" : "NULL");
      console.log(
        "Access token:",
        sessionData.session?.access_token ? "YES" : "NO",
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("User:", user?.id || "NULL");

      if (!user) throw new Error("Not authenticated");

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
        await uploadFiles(wish.id);
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

        // Handle removed existing images
        if (initialData.wish_media) {
          const removedImages = initialData.wish_media.filter(
            (m) => m.type === "image" && !existingImages.includes(m.file_url),
          );
          for (const media of removedImages) {
            await supabase.from("wish_media").delete().eq("id", media.id);
          }
        }

        // Handle removed audio
        if (removedExistingAudio && initialData.wish_media) {
          const audioMedia = initialData.wish_media.find(
            (m) => m.type === "audio",
          );
          if (audioMedia) {
            await supabase.from("wish_media").delete().eq("id", audioMedia.id);
          }
        }

        await uploadFiles(initialData.id);
      }

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
        <ImageUploader
          files={imageFiles}
          onChange={setImageFiles}
          existingUrls={existingImages}
          onRemoveExisting={(url: string) =>
            setExistingImages((prev: string[]) =>
              prev.filter((u: string) => u !== url),
            )
          }
        />
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
