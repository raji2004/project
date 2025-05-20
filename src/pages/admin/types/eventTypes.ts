export interface Event {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  location: string;
  type: "lecture" | "exam" | "assignment" | "other";
  created_at: string;
  updated_at: string;
}
