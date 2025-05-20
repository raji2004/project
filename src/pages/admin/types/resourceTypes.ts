export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: "pdf" | "video" | "link";
  flow: string;
  department_id: string;
  resource_type?: string;
  created_at: string;
}
