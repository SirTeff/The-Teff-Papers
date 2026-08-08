export type MarginTargetTypeDatabase = "paper";
export type MarginStatusDatabase = "pending" | "approved" | "rejected" | "spam" | "removed";
export type ModerationActionDatabase =
  | "approved"
  | "rejected"
  | "marked_spam"
  | "removed"
  | "restored_pending"
  | "restored_approved"
  | "featured"
  | "unfeatured";

export type MarginEntryRow = {
  id: string;
  target_type: MarginTargetTypeDatabase;
  target_key: string;
  display_name: string | null;
  body: string;
  status: MarginStatusDatabase;
  featured: boolean;
  created_at: string;
  moderated_at: string | null;
  published_at: string | null;
  moderated_by: string | null;
  moderation_note: string | null;
  submission_key: string;
};

export type PublicMarginEntryRow = Pick<
  MarginEntryRow,
  "id" | "target_type" | "target_key" | "display_name" | "body" | "created_at" | "published_at" | "featured"
>;

export type SupabaseDatabase = {
  public: {
    Tables: {
      margin_entries: {
        Row: MarginEntryRow;
        Insert: Omit<MarginEntryRow, "id" | "status" | "featured" | "created_at" | "moderated_at" | "published_at" | "moderated_by" | "moderation_note"> &
          Partial<Pick<MarginEntryRow, "id" | "status" | "featured" | "created_at" | "moderated_at" | "published_at" | "moderated_by" | "moderation_note">>;
        Update: Partial<MarginEntryRow>;
        Relationships: [];
      };
      margin_settings: {
        Row: {
          target_type: MarginTargetTypeDatabase;
          target_key: string;
          is_open: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          target_type: MarginTargetTypeDatabase;
          target_key: string;
          is_open?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          target_type: MarginTargetTypeDatabase;
          target_key: string;
          is_open: boolean;
          created_at: string;
          updated_at: string;
        }>;
        Relationships: [];
      };
      moderation_events: {
        Row: {
          id: string;
          entry_id: string;
          action: ModerationActionDatabase;
          actor: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          action: ModerationActionDatabase;
          actor: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      margin_submission_rate_limits: {
        Row: {
          identifier_hash: string;
          target_type: MarginTargetTypeDatabase;
          target_key: string;
          window_start: string;
          request_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          identifier_hash: string;
          target_type: MarginTargetTypeDatabase;
          target_key: string;
          window_start: string;
          request_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<{
          request_count: number;
          updated_at: string;
        }>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_public_margin_entries: {
        Args: { p_target_type: MarginTargetTypeDatabase; p_target_key: string };
        Returns: PublicMarginEntryRow[];
      };
      get_public_margin_setting: {
        Args: { p_target_type: MarginTargetTypeDatabase; p_target_key: string };
        Returns: boolean;
      };
      admin_get_margin_counts: {
        Args: Record<string, never>;
        Returns: {
          pending: number;
          approved: number;
          rejected: number;
          spam: number;
          removed: number;
        };
      };
      admin_list_margin_entries: {
        Args: {
          p_status: MarginStatusDatabase;
          p_limit?: number;
          p_offset?: number;
          p_target_type?: MarginTargetTypeDatabase | null;
          p_target_key?: string | null;
        };
        Returns: Array<Omit<MarginEntryRow, "submission_key"> & { total_count: number }>;
      };
      admin_get_margin_entry: {
        Args: { p_entry_id: string };
        Returns: MarginEntryRow[];
      };
      admin_get_margin_history: {
        Args: { p_entry_id: string };
        Returns: SupabaseDatabase["public"]["Tables"]["moderation_events"]["Row"][];
      };
      admin_moderate_margin_entry: {
        Args: { p_entry_id: string; p_target_status: MarginStatusDatabase; p_actor: string; p_reason?: string | null };
        Returns: MarginEntryRow[];
      };
      admin_set_margin_featured: {
        Args: { p_entry_id: string; p_featured: boolean; p_actor: string; p_reason?: string | null };
        Returns: MarginEntryRow[];
      };
      consume_margin_submission_rate_limit: {
        Args: {
          p_identifier_hash: string;
          p_target_type: MarginTargetTypeDatabase;
          p_target_key: string;
          p_window_seconds: number;
          p_request_limit: number;
        };
        Returns: Array<{ allowed: boolean; remaining: number; retry_after_seconds: number }>;
      };
      submit_margin_entry: {
        Args: {
          p_target_type: MarginTargetTypeDatabase;
          p_target_key: string;
          p_display_name: string | null;
          p_body: string;
          p_submission_key: string;
        };
        Returns: Array<{ id: string; status: MarginStatusDatabase; created_at: string; duplicate: boolean }>;
      };
    };
    Enums: {
      margin_target_type: MarginTargetTypeDatabase;
      margin_status: MarginStatusDatabase;
      moderation_action: ModerationActionDatabase;
    };
    CompositeTypes: Record<string, never>;
  };
};
