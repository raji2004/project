// Utility to construct the public avatar URL for Supabase Storage
export function getAvatarUrl(avatar_url?: string): string {
  if (!avatar_url) return "";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (avatar_url.startsWith("http")) return avatar_url;
  return `${supabaseUrl}/storage/v1/object/public/avatars/${avatar_url}`;
}
