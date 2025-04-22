
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string;
  onPhotoUpdate?: (newUrl: string) => void;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

export default function ProfilePhotoUpload({
  userId,
  currentPhotoUrl,
  onPhotoUpdate,
  size = "md",
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl || "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Safety check - require userId for file uploads
    if (!userId) {
      toast.error("User ID is required for uploading photos");
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      setPreviewUrl(publicUrl);
      if (onPhotoUpdate) {
        onPhotoUpdate(publicUrl);
      }

      toast.success("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  // Generate fallback text safely
  const generateFallback = () => {
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
      return "U"; // Default fallback if userId is missing or empty
    }
    return userId[0].toUpperCase();
  };

  return (
    <div className="relative">
      <Avatar className={`${sizeClasses[size]} relative`}>
        <AvatarImage src={previewUrl} alt="Profile photo" />
        <AvatarFallback className="bg-slate-700 text-slate-300">
          {generateFallback()}
        </AvatarFallback>
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          </div>
        )}
      </Avatar>
      <label
        htmlFor="profile-photo"
        className="absolute bottom-0 right-0 bg-slate-800 p-2 rounded-full cursor-pointer hover:bg-slate-700 transition-colors"
      >
        <Upload className="h-4 w-4 text-slate-300" />
      </label>
      <input
        id="profile-photo"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
