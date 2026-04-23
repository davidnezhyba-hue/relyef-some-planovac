export type ProductionStatus = "in_progress" | "done";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface DesignerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface VideoRow {
  id: string;
  title: string;
  date_assigned: string | null;
  materials_ready: boolean;
  materials_url: string | null;
  assigned_to_designer: boolean;
  designer_id: string | null;
  production_status: ProductionStatus;
  finished_video_folder_url: string | null;
  approval_status: ApprovalStatus;
  approval_sent_at: string | null;
  published_fb: string | null;
  published_ig: string | null;
  published_yt: string | null;
  published_tiktok: string | null;
  published_pinterest: string | null;
  results_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type VideoUpdate = Partial<Omit<VideoRow, "id" | "created_at">>;

export interface VideoCommentRow {
  id: string;
  video_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      designers: {
        Row: DesignerRow;
        Insert: Omit<DesignerRow, "id" | "created_at">;
        Update: Partial<Omit<DesignerRow, "id" | "created_at">>;
      };
      videos: {
        Row: VideoRow;
        Insert: Omit<VideoRow, "id" | "created_at" | "updated_at">;
        Update: VideoUpdate;
      };
    };
  };
}
