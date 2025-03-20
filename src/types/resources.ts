export interface Department {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export interface LectureResource {
  id: string;
  department_id: string;
  title: string;
  description: string | null;
  url: string;
  type: 'pdf' | 'video' | 'link';
  created_at: string;
}

export interface ResourcesState {
  departments: Department[];
  resources: LectureResource[];
  selectedDepartment: string | null;
  loading: boolean;
  error: string | null;
  fetchDepartments: () => Promise<void>;
  fetchResourcesByDepartment: (departmentId: string) => Promise<void>;
  setSelectedDepartment: (departmentId: string | null) => void;
}