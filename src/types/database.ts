/**
 * NUMBER OVER — Types de base de données (GÉNÉRÉ — ne pas éditer à la main)
 * Généré par scripts/gen-db-types.mjs le 2026-09-17T17:58:22.097Z
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: number;
          actor_id: string | null;
          actor_role: Database["public"]["Enums"]["app_role"] | null;
          action: string;
          entity_table: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["app_role"] | null;
          action: string;
          entity_table: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_id?: string | null;
          actor_role?: Database["public"]["Enums"]["app_role"] | null;
          action?: string;
          entity_table?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [

        ];
      };
      calls: {
        Row: {
          id: string;
          rental_id: string | null;
          phone_number_id: string;
          user_id: string | null;
          direction: Database["public"]["Enums"]["comm_direction"];
          counterparty_masked: string;
          counterparty_hash: string;
          provider_call_sid: string;
          status: Database["public"]["Enums"]["call_status"];
          duration_seconds: number | null;
          provider_price: number | null;
          provider_price_unit: string | null;
          started_at: string | null;
          ended_at: string | null;
          retention_until: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          rental_id?: string | null;
          phone_number_id: string;
          user_id?: string | null;
          direction: Database["public"]["Enums"]["comm_direction"];
          counterparty_masked: string;
          counterparty_hash: string;
          provider_call_sid: string;
          status: Database["public"]["Enums"]["call_status"];
          duration_seconds?: number | null;
          provider_price?: number | null;
          provider_price_unit?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          retention_until: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rental_id?: string | null;
          phone_number_id?: string;
          user_id?: string | null;
          direction?: Database["public"]["Enums"]["comm_direction"];
          counterparty_masked?: string;
          counterparty_hash?: string;
          provider_call_sid?: string;
          status?: Database["public"]["Enums"]["call_status"];
          duration_seconds?: number | null;
          provider_price?: number | null;
          provider_price_unit?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          retention_until?: string;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "calls_rental_id_fkey"; columns: ["rental_id"]; isOneToOne: false; referencedRelation: "rentals"; referencedColumns: ["id"]; },
          { foreignKeyName: "calls_phone_number_id_fkey"; columns: ["phone_number_id"]; isOneToOne: false; referencedRelation: "phone_numbers"; referencedColumns: ["id"]; },
          { foreignKeyName: "calls_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      content_blocks: {
        Row: {
          id: string;
          page_id: string;
          content_key: string;
          locale: string;
          title: string | null;
          body_md: string;
          status: Database["public"]["Enums"]["content_status"];
          version: number;
          published_at: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          content_key: string;
          locale?: string;
          title?: string | null;
          body_md?: string;
          status?: Database["public"]["Enums"]["content_status"];
          version?: number;
          published_at?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          content_key?: string;
          locale?: string;
          title?: string | null;
          body_md?: string;
          status?: Database["public"]["Enums"]["content_status"];
          version?: number;
          published_at?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "content_blocks_updated_by_fkey"; columns: ["updated_by"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      countries: {
        Row: {
          id: number;
          iso2: string;
          name: string;
          calling_code: string;
          is_enabled: boolean;
          resale_allowed: boolean;
          resale_reviewed_at: string | null;
          resale_reviewed_by: string | null;
          resale_review_note: string | null;
          compliance_warning: string | null;
          requires_bundle: boolean | null;
          requires_address: boolean | null;
          available_types: Database["public"]["Enums"]["number_type_code"][];
          provider_beta: boolean;
          last_synced_at: string | null;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          iso2: string;
          name: string;
          calling_code: string;
          is_enabled?: boolean;
          resale_allowed?: boolean;
          resale_reviewed_at?: string | null;
          resale_reviewed_by?: string | null;
          resale_review_note?: string | null;
          compliance_warning?: string | null;
          requires_bundle?: boolean | null;
          requires_address?: boolean | null;
          available_types?: Database["public"]["Enums"]["number_type_code"][];
          provider_beta?: boolean;
          last_synced_at?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          iso2?: string;
          name?: string;
          calling_code?: string;
          is_enabled?: boolean;
          resale_allowed?: boolean;
          resale_reviewed_at?: string | null;
          resale_reviewed_by?: string | null;
          resale_review_note?: string | null;
          compliance_warning?: string | null;
          requires_bundle?: boolean | null;
          requires_address?: boolean | null;
          available_types?: Database["public"]["Enums"]["number_type_code"][];
          provider_beta?: boolean;
          last_synced_at?: string | null;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "countries_resale_reviewed_by_fkey"; columns: ["resale_reviewed_by"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      job_queue: {
        Row: {
          id: string;
          job_type: string;
          payload: Json;
          dedupe_key: string | null;
          status: Database["public"]["Enums"]["job_status"];
          priority: number;
          attempts: number;
          max_attempts: number;
          run_after: string;
          locked_at: string | null;
          locked_by: string | null;
          started_at: string | null;
          finished_at: string | null;
          last_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_type: string;
          payload?: Json;
          dedupe_key?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          priority?: number;
          attempts?: number;
          max_attempts?: number;
          run_after?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          last_error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_type?: string;
          payload?: Json;
          dedupe_key?: string | null;
          status?: Database["public"]["Enums"]["job_status"];
          priority?: number;
          attempts?: number;
          max_attempts?: number;
          run_after?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          last_error?: string | null;
          created_at?: string;
        };
        Relationships: [

        ];
      };
      messages: {
        Row: {
          id: string;
          rental_id: string | null;
          phone_number_id: string;
          user_id: string | null;
          direction: Database["public"]["Enums"]["comm_direction"];
          counterparty_masked: string;
          counterparty_hash: string;
          provider_message_sid: string;
          status: Database["public"]["Enums"]["message_status"];
          body_encrypted: string | null;
          body_purged_at: string | null;
          segments: number | null;
          provider_price: number | null;
          provider_price_unit: string | null;
          error_code: string | null;
          occurred_at: string;
          retention_until: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          rental_id?: string | null;
          phone_number_id: string;
          user_id?: string | null;
          direction: Database["public"]["Enums"]["comm_direction"];
          counterparty_masked: string;
          counterparty_hash: string;
          provider_message_sid: string;
          status: Database["public"]["Enums"]["message_status"];
          body_encrypted?: string | null;
          body_purged_at?: string | null;
          segments?: number | null;
          provider_price?: number | null;
          provider_price_unit?: string | null;
          error_code?: string | null;
          occurred_at?: string;
          retention_until: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          rental_id?: string | null;
          phone_number_id?: string;
          user_id?: string | null;
          direction?: Database["public"]["Enums"]["comm_direction"];
          counterparty_masked?: string;
          counterparty_hash?: string;
          provider_message_sid?: string;
          status?: Database["public"]["Enums"]["message_status"];
          body_encrypted?: string | null;
          body_purged_at?: string | null;
          segments?: number | null;
          provider_price?: number | null;
          provider_price_unit?: string | null;
          error_code?: string | null;
          occurred_at?: string;
          retention_until?: string;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "messages_rental_id_fkey"; columns: ["rental_id"]; isOneToOne: false; referencedRelation: "rentals"; referencedColumns: ["id"]; },
          { foreignKeyName: "messages_phone_number_id_fkey"; columns: ["phone_number_id"]; isOneToOne: false; referencedRelation: "phone_numbers"; referencedColumns: ["id"]; },
          { foreignKeyName: "messages_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          link_path: string | null;
          channel: Database["public"]["Enums"]["notification_channel"];
          read_at: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          body?: string | null;
          link_path?: string | null;
          channel?: Database["public"]["Enums"]["notification_channel"];
          read_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          body?: string | null;
          link_path?: string | null;
          channel?: Database["public"]["Enums"]["notification_channel"];
          read_at?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "notifications_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      number_types: {
        Row: {
          id: number;
          code: Database["public"]["Enums"]["number_type_code"];
          label: string;
          description: string | null;
          is_enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: Database["public"]["Enums"]["number_type_code"];
          label: string;
          description?: string | null;
          is_enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: Database["public"]["Enums"]["number_type_code"];
          label?: string;
          description?: string | null;
          is_enabled?: boolean;
          created_at?: string;
        };
        Relationships: [

        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          phone_number_id: string;
          item_type: Database["public"]["Enums"]["order_item_type"];
          duration_months: number;
          quantity: number;
          unit_price: number;
          total: number;
          currency: string;
          provider_cost: number | null;
          snapshot: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          phone_number_id: string;
          item_type: Database["public"]["Enums"]["order_item_type"];
          duration_months: number;
          quantity?: number;
          unit_price: number;
          total: number;
          currency: string;
          provider_cost?: number | null;
          snapshot?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          phone_number_id?: string;
          item_type?: Database["public"]["Enums"]["order_item_type"];
          duration_months?: number;
          quantity?: number;
          unit_price?: number;
          total?: number;
          currency?: string;
          provider_cost?: number | null;
          snapshot?: Json;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"]; },
          { foreignKeyName: "order_items_phone_number_id_fkey"; columns: ["phone_number_id"]; isOneToOne: false; referencedRelation: "phone_numbers"; referencedColumns: ["id"]; }
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          public_reference: string;
          status: Database["public"]["Enums"]["order_status"];
          currency: string;
          subtotal: number;
          fees: number;
          discount: number;
          tax: number;
          total: number;
          provider_cost_estimate: number | null;
          idempotency_key: string;
          expires_at: string | null;
          paid_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          failure_reason: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          public_reference?: string;
          status?: Database["public"]["Enums"]["order_status"];
          currency: string;
          subtotal?: number;
          fees?: number;
          discount?: number;
          tax?: number;
          total?: number;
          provider_cost_estimate?: number | null;
          idempotency_key: string;
          expires_at?: string | null;
          paid_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          failure_reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          public_reference?: string;
          status?: Database["public"]["Enums"]["order_status"];
          currency?: string;
          subtotal?: number;
          fees?: number;
          discount?: number;
          tax?: number;
          total?: number;
          provider_cost_estimate?: number | null;
          idempotency_key?: string;
          expires_at?: string | null;
          paid_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          failure_reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "orders_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          provider: Database["public"]["Enums"]["provider_name"];
          provider_payment_id: string | null;
          provider_session_id: string | null;
          status: Database["public"]["Enums"]["payment_status"];
          amount: number;
          currency: string;
          fee_amount: number | null;
          net_amount: number | null;
          payment_method_type: string | null;
          confirmed_at: string | null;
          failed_at: string | null;
          failure_code: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          provider: Database["public"]["Enums"]["provider_name"];
          provider_payment_id?: string | null;
          provider_session_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          amount: number;
          currency: string;
          fee_amount?: number | null;
          net_amount?: number | null;
          payment_method_type?: string | null;
          confirmed_at?: string | null;
          failed_at?: string | null;
          failure_code?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          provider?: Database["public"]["Enums"]["provider_name"];
          provider_payment_id?: string | null;
          provider_session_id?: string | null;
          status?: Database["public"]["Enums"]["payment_status"];
          amount?: number;
          currency?: string;
          fee_amount?: number | null;
          net_amount?: number | null;
          payment_method_type?: string | null;
          confirmed_at?: string | null;
          failed_at?: string | null;
          failure_code?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "payments_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"]; },
          { foreignKeyName: "payments_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      phone_number_capabilities: {
        Row: {
          phone_number_id: string;
          sms_inbound: boolean | null;
          sms_outbound: boolean | null;
          mms_inbound: boolean | null;
          mms_outbound: boolean | null;
          voice_inbound: boolean | null;
          voice_outbound: boolean | null;
          fax: boolean | null;
          raw_capabilities: Json | null;
          source: Database["public"]["Enums"]["price_source"];
          verified_at: string | null;
          updated_at: string;
        };
        Insert: {
          phone_number_id: string;
          sms_inbound?: boolean | null;
          sms_outbound?: boolean | null;
          mms_inbound?: boolean | null;
          mms_outbound?: boolean | null;
          voice_inbound?: boolean | null;
          voice_outbound?: boolean | null;
          fax?: boolean | null;
          raw_capabilities?: Json | null;
          source?: Database["public"]["Enums"]["price_source"];
          verified_at?: string | null;
          updated_at?: string;
        };
        Update: {
          phone_number_id?: string;
          sms_inbound?: boolean | null;
          sms_outbound?: boolean | null;
          mms_inbound?: boolean | null;
          mms_outbound?: boolean | null;
          voice_inbound?: boolean | null;
          voice_outbound?: boolean | null;
          fax?: boolean | null;
          raw_capabilities?: Json | null;
          source?: Database["public"]["Enums"]["price_source"];
          verified_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "phone_number_capabilities_phone_number_id_fkey"; columns: ["phone_number_id"]; isOneToOne: false; referencedRelation: "phone_numbers"; referencedColumns: ["id"]; }
        ];
      };
      phone_number_prices: {
        Row: {
          id: string;
          phone_number_id: string | null;
          country_id: number | null;
          number_type_id: number | null;
          period: Database["public"]["Enums"]["price_period"];
          currency: string;
          provider_monthly_cost: number | null;
          provider_setup_cost: number | null;
          margin_type: Database["public"]["Enums"]["margin_type"] | null;
          margin_value: number | null;
          rental_monthly_price: number | null;
          purchase_price: number | null;
          enforce_min_margin: boolean;
          source: Database["public"]["Enums"]["price_source"];
          is_active: boolean;
          valid_from: string;
          valid_to: string | null;
          synced_at: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_number_id?: string | null;
          country_id?: number | null;
          number_type_id?: number | null;
          period?: Database["public"]["Enums"]["price_period"];
          currency: string;
          provider_monthly_cost?: number | null;
          provider_setup_cost?: number | null;
          margin_type?: Database["public"]["Enums"]["margin_type"] | null;
          margin_value?: number | null;
          rental_monthly_price?: number | null;
          purchase_price?: number | null;
          enforce_min_margin?: boolean;
          source: Database["public"]["Enums"]["price_source"];
          is_active?: boolean;
          valid_from?: string;
          valid_to?: string | null;
          synced_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone_number_id?: string | null;
          country_id?: number | null;
          number_type_id?: number | null;
          period?: Database["public"]["Enums"]["price_period"];
          currency?: string;
          provider_monthly_cost?: number | null;
          provider_setup_cost?: number | null;
          margin_type?: Database["public"]["Enums"]["margin_type"] | null;
          margin_value?: number | null;
          rental_monthly_price?: number | null;
          purchase_price?: number | null;
          enforce_min_margin?: boolean;
          source?: Database["public"]["Enums"]["price_source"];
          is_active?: boolean;
          valid_from?: string;
          valid_to?: string | null;
          synced_at?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "phone_number_prices_phone_number_id_fkey"; columns: ["phone_number_id"]; isOneToOne: false; referencedRelation: "phone_numbers"; referencedColumns: ["id"]; },
          { foreignKeyName: "phone_number_prices_country_id_fkey"; columns: ["country_id"]; isOneToOne: false; referencedRelation: "countries"; referencedColumns: ["id"]; },
          { foreignKeyName: "phone_number_prices_number_type_id_fkey"; columns: ["number_type_id"]; isOneToOne: false; referencedRelation: "number_types"; referencedColumns: ["id"]; },
          { foreignKeyName: "phone_number_prices_created_by_fkey"; columns: ["created_by"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      phone_numbers: {
        Row: {
          id: string;
          e164: string;
          masked_e164: string | null;
          country_id: number;
          number_type_id: number;
          provider: Database["public"]["Enums"]["provider_name"];
          provider_sid: string | null;
          status: Database["public"]["Enums"]["phone_number_status"];
          source: Database["public"]["Enums"]["phone_number_source"];
          is_available: boolean;
          is_featured: boolean;
          reserved_until: string | null;
          reserved_by_order_id: string | null;
          locality: string | null;
          region: string | null;
          friendly_name: string | null;
          requires_address: boolean | null;
          requires_bundle: boolean | null;
          metadata: Json;
          last_synced_at: string | null;
          acquired_at: string | null;
          released_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          e164: string;
          country_id: number;
          number_type_id: number;
          provider?: Database["public"]["Enums"]["provider_name"];
          provider_sid?: string | null;
          status?: Database["public"]["Enums"]["phone_number_status"];
          source: Database["public"]["Enums"]["phone_number_source"];
          is_available?: boolean;
          is_featured?: boolean;
          reserved_until?: string | null;
          reserved_by_order_id?: string | null;
          locality?: string | null;
          region?: string | null;
          friendly_name?: string | null;
          requires_address?: boolean | null;
          requires_bundle?: boolean | null;
          metadata?: Json;
          last_synced_at?: string | null;
          acquired_at?: string | null;
          released_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          e164?: string;
          country_id?: number;
          number_type_id?: number;
          provider?: Database["public"]["Enums"]["provider_name"];
          provider_sid?: string | null;
          status?: Database["public"]["Enums"]["phone_number_status"];
          source?: Database["public"]["Enums"]["phone_number_source"];
          is_available?: boolean;
          is_featured?: boolean;
          reserved_until?: string | null;
          reserved_by_order_id?: string | null;
          locality?: string | null;
          region?: string | null;
          friendly_name?: string | null;
          requires_address?: boolean | null;
          requires_bundle?: boolean | null;
          metadata?: Json;
          last_synced_at?: string | null;
          acquired_at?: string | null;
          released_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "phone_numbers_country_id_fkey"; columns: ["country_id"]; isOneToOne: false; referencedRelation: "countries"; referencedColumns: ["id"]; },
          { foreignKeyName: "phone_numbers_number_type_id_fkey"; columns: ["number_type_id"]; isOneToOne: false; referencedRelation: "number_types"; referencedColumns: ["id"]; },
          { foreignKeyName: "phone_numbers_reserved_by_order_fk"; columns: ["reserved_by_order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"]; }
        ];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          phone_contact: string | null;
          locale: string;
          timezone: string;
          status: Database["public"]["Enums"]["account_status"];
          blocked_at: string | null;
          blocked_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          phone_contact?: string | null;
          locale?: string;
          timezone?: string;
          status?: Database["public"]["Enums"]["account_status"];
          blocked_at?: string | null;
          blocked_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          phone_contact?: string | null;
          locale?: string;
          timezone?: string;
          status?: Database["public"]["Enums"]["account_status"];
          blocked_at?: string | null;
          blocked_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "profiles_id_fkey"; columns: ["id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      provider_api_logs: {
        Row: {
          id: number;
          provider: Database["public"]["Enums"]["provider_name"];
          service: string;
          method: string;
          endpoint: string;
          http_status: number | null;
          duration_ms: number | null;
          ok: boolean;
          provider_error_code: string | null;
          error_message: string | null;
          correlation_id: string | null;
          related_order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          provider: Database["public"]["Enums"]["provider_name"];
          service: string;
          method: string;
          endpoint: string;
          http_status?: number | null;
          duration_ms?: number | null;
          ok: boolean;
          provider_error_code?: string | null;
          error_message?: string | null;
          correlation_id?: string | null;
          related_order_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          provider?: Database["public"]["Enums"]["provider_name"];
          service?: string;
          method?: string;
          endpoint?: string;
          http_status?: number | null;
          duration_ms?: number | null;
          ok?: boolean;
          provider_error_code?: string | null;
          error_message?: string | null;
          correlation_id?: string | null;
          related_order_id?: string | null;
          created_at?: string;
        };
        Relationships: [

        ];
      };
      refunds: {
        Row: {
          id: string;
          payment_id: string;
          order_id: string;
          amount: number;
          currency: string;
          reason: string;
          status: Database["public"]["Enums"]["refund_status"];
          provider_refund_id: string | null;
          requested_by: string | null;
          approved_by: string | null;
          notes: string | null;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          payment_id: string;
          order_id: string;
          amount: number;
          currency: string;
          reason: string;
          status?: Database["public"]["Enums"]["refund_status"];
          provider_refund_id?: string | null;
          requested_by?: string | null;
          approved_by?: string | null;
          notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          payment_id?: string;
          order_id?: string;
          amount?: number;
          currency?: string;
          reason?: string;
          status?: Database["public"]["Enums"]["refund_status"];
          provider_refund_id?: string | null;
          requested_by?: string | null;
          approved_by?: string | null;
          notes?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "refunds_payment_id_fkey"; columns: ["payment_id"]; isOneToOne: false; referencedRelation: "payments"; referencedColumns: ["id"]; },
          { foreignKeyName: "refunds_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"]; },
          { foreignKeyName: "refunds_requested_by_fkey"; columns: ["requested_by"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; },
          { foreignKeyName: "refunds_approved_by_fkey"; columns: ["approved_by"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      rentals: {
        Row: {
          id: string;
          user_id: string;
          phone_number_id: string;
          order_id: string;
          order_item_id: string | null;
          kind: Database["public"]["Enums"]["rental_kind"];
          status: Database["public"]["Enums"]["rental_status"];
          period_months: number;
          starts_at: string | null;
          ends_at: string | null;
          grace_until: string | null;
          next_billing_at: string | null;
          auto_renew: boolean;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          released_at: string | null;
          failure_reason: string | null;
          forward_to_encrypted: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone_number_id: string;
          order_id: string;
          order_item_id?: string | null;
          kind: Database["public"]["Enums"]["rental_kind"];
          status?: Database["public"]["Enums"]["rental_status"];
          period_months: number;
          starts_at?: string | null;
          ends_at?: string | null;
          grace_until?: string | null;
          next_billing_at?: string | null;
          auto_renew?: boolean;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          released_at?: string | null;
          failure_reason?: string | null;
          forward_to_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phone_number_id?: string;
          order_id?: string;
          order_item_id?: string | null;
          kind?: Database["public"]["Enums"]["rental_kind"];
          status?: Database["public"]["Enums"]["rental_status"];
          period_months?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          grace_until?: string | null;
          next_billing_at?: string | null;
          auto_renew?: boolean;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          released_at?: string | null;
          failure_reason?: string | null;
          forward_to_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "rentals_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; },
          { foreignKeyName: "rentals_phone_number_id_fkey"; columns: ["phone_number_id"]; isOneToOne: false; referencedRelation: "phone_numbers"; referencedColumns: ["id"]; },
          { foreignKeyName: "rentals_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"]; },
          { foreignKeyName: "rentals_order_item_id_fkey"; columns: ["order_item_id"]; isOneToOne: false; referencedRelation: "order_items"; referencedColumns: ["id"]; }
        ];
      };
      roles: {
        Row: {
          id: number;
          code: Database["public"]["Enums"]["app_role"];
          label: string;
          description: string | null;
          permissions: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: Database["public"]["Enums"]["app_role"];
          label: string;
          description?: string | null;
          permissions?: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: Database["public"]["Enums"]["app_role"];
          label?: string;
          description?: string | null;
          permissions?: Json;
          created_at?: string;
        };
        Relationships: [

        ];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          is_critical: boolean;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          is_critical?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          is_critical?: boolean;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "site_settings_updated_by_fkey"; columns: ["updated_by"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          rental_id: string;
          provider: Database["public"]["Enums"]["provider_name"];
          provider_subscription_id: string | null;
          status: Database["public"]["Enums"]["subscription_status"];
          auto_renew: boolean;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          rental_id: string;
          provider: Database["public"]["Enums"]["provider_name"];
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          auto_renew?: boolean;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          rental_id?: string;
          provider?: Database["public"]["Enums"]["provider_name"];
          provider_subscription_id?: string | null;
          status?: Database["public"]["Enums"]["subscription_status"];
          auto_renew?: boolean;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "subscriptions_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; },
          { foreignKeyName: "subscriptions_rental_id_fkey"; columns: ["rental_id"]; isOneToOne: false; referencedRelation: "rentals"; referencedColumns: ["id"]; }
        ];
      };
      support_messages: {
        Row: {
          id: string;
          ticket_id: string;
          author_id: string | null;
          author_kind: Database["public"]["Enums"]["ticket_author_kind"];
          body: string;
          is_internal: boolean;
          attachments: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          author_id?: string | null;
          author_kind: Database["public"]["Enums"]["ticket_author_kind"];
          body: string;
          is_internal?: boolean;
          attachments?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          author_id?: string | null;
          author_kind?: Database["public"]["Enums"]["ticket_author_kind"];
          body?: string;
          is_internal?: boolean;
          attachments?: Json;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "support_messages_ticket_id_fkey"; columns: ["ticket_id"]; isOneToOne: false; referencedRelation: "support_tickets"; referencedColumns: ["id"]; },
          { foreignKeyName: "support_messages_author_id_fkey"; columns: ["author_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          public_reference: string;
          subject: string;
          category: string | null;
          status: Database["public"]["Enums"]["ticket_status"];
          priority: Database["public"]["Enums"]["ticket_priority"];
          assigned_to: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          public_reference?: string;
          subject: string;
          category?: string | null;
          status?: Database["public"]["Enums"]["ticket_status"];
          priority?: Database["public"]["Enums"]["ticket_priority"];
          assigned_to?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          public_reference?: string;
          subject?: string;
          category?: string | null;
          status?: Database["public"]["Enums"]["ticket_status"];
          priority?: Database["public"]["Enums"]["ticket_priority"];
          assigned_to?: string | null;
          closed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "support_tickets_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; },
          { foreignKeyName: "support_tickets_assigned_to_fkey"; columns: ["assigned_to"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      user_roles: {
        Row: {
          user_id: string;
          role_id: number;
          granted_by: string | null;
          granted_at: string;
        };
        Insert: {
          user_id: string;
          role_id: number;
          granted_by?: string | null;
          granted_at?: string;
        };
        Update: {
          user_id?: string;
          role_id?: number;
          granted_by?: string | null;
          granted_at?: string;
        };
        Relationships: [
          { foreignKeyName: "user_roles_user_id_fkey"; columns: ["user_id"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; },
          { foreignKeyName: "user_roles_role_id_fkey"; columns: ["role_id"]; isOneToOne: false; referencedRelation: "roles"; referencedColumns: ["id"]; },
          { foreignKeyName: "user_roles_granted_by_fkey"; columns: ["granted_by"]; isOneToOne: false; referencedRelation: "users"; referencedColumns: ["id"]; }
        ];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: Database["public"]["Enums"]["provider_name"];
          provider_event_id: string;
          event_type: string;
          payload: Json;
          signature_valid: boolean;
          processing_status: Database["public"]["Enums"]["webhook_processing_status"];
          attempts: number;
          last_error: string | null;
          related_order_id: string | null;
          received_at: string;
          processed_at: string | null;
        };
        Insert: {
          id?: string;
          provider: Database["public"]["Enums"]["provider_name"];
          provider_event_id: string;
          event_type: string;
          payload: Json;
          signature_valid: boolean;
          processing_status?: Database["public"]["Enums"]["webhook_processing_status"];
          attempts?: number;
          last_error?: string | null;
          related_order_id?: string | null;
          received_at?: string;
          processed_at?: string | null;
        };
        Update: {
          id?: string;
          provider?: Database["public"]["Enums"]["provider_name"];
          provider_event_id?: string;
          event_type?: string;
          payload?: Json;
          signature_valid?: boolean;
          processing_status?: Database["public"]["Enums"]["webhook_processing_status"];
          attempts?: number;
          last_error?: string | null;
          related_order_id?: string | null;
          received_at?: string;
          processed_at?: string | null;
        };
        Relationships: [
          { foreignKeyName: "webhook_events_related_order_id_fkey"; columns: ["related_order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"]; }
        ];
      };
      webhooks: {
        Row: {
          id: string;
          provider: Database["public"]["Enums"]["provider_name"];
          event_kind: string;
          endpoint_path: string;
          status: Database["public"]["Enums"]["webhook_status"];
          secret_env_name: string | null;
          last_received_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider: Database["public"]["Enums"]["provider_name"];
          event_kind: string;
          endpoint_path: string;
          status?: Database["public"]["Enums"]["webhook_status"];
          secret_env_name?: string | null;
          last_received_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: Database["public"]["Enums"]["provider_name"];
          event_kind?: string;
          endpoint_path?: string;
          status?: Database["public"]["Enums"]["webhook_status"];
          secret_env_name?: string | null;
          last_received_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [

        ];
      };
    };
    Views: {
      catalog_countries: {
        Row: {
          id: number | null;
          iso2: string | null;
          name: string | null;
          calling_code: string | null;
          available_types: Database["public"]["Enums"]["number_type_code"][] | null;
          requires_bundle: boolean | null;
          requires_address: boolean | null;
          compliance_warning: string | null;
          display_order: number | null;
        };
        Relationships: [];
      };
      catalog_number_prices: {
        Row: {
          id: string | null;
          phone_number_id: string | null;
          country_id: number | null;
          number_type_id: number | null;
          period: Database["public"]["Enums"]["price_period"] | null;
          currency: string | null;
          rental_monthly_price: number | null;
          purchase_price: number | null;
          valid_from: string | null;
        };
        Relationships: [];
      };
      catalog_numbers: {
        Row: {
          id: string | null;
          masked_e164: string | null;
          country_id: number | null;
          number_type_id: number | null;
          is_featured: boolean | null;
          locality: string | null;
          region: string | null;
          requires_address: boolean | null;
          requires_bundle: boolean | null;
          sms_inbound: boolean | null;
          sms_outbound: boolean | null;
          mms_inbound: boolean | null;
          voice_inbound: boolean | null;
          voice_outbound: boolean | null;
          rental_monthly_price: number | null;
          purchase_price: number | null;
          currency: string | null;
        };
        Relationships: [];
      };
      public_settings: {
        Row: {
          key: string | null;
          value: Json | null;
        };
        Relationships: [];
      };
      published_content: {
        Row: {
          page_id: string | null;
          content_key: string | null;
          locale: string | null;
          title: string | null;
          body_md: string | null;
          published_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      audit_row_change: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      check_refund_total: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      claim_next_job: { Args: Record<string, unknown>; Returns: unknown; }; // (p_worker text, p_types text[] DEFAULT NULL::text[]) → SETOF job_queue
      current_role_code: { Args: Record<string, unknown>; Returns: unknown; }; // () → app_role
      generate_public_reference: { Args: Record<string, unknown>; Returns: unknown; }; // (prefix text DEFAULT 'NO'::text) → text
      guard_user_roles: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      handle_new_auth_user: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      has_role: { Args: Record<string, unknown>; Returns: unknown; }; // (p_role app_role) → boolean
      is_admin: { Args: Record<string, unknown>; Returns: unknown; }; // () → boolean
      is_staff: { Args: Record<string, unknown>; Returns: unknown; }; // () → boolean
      is_superadmin: { Args: Record<string, unknown>; Returns: unknown; }; // () → boolean
      mask_e164: { Args: Record<string, unknown>; Returns: unknown; }; // (p text) → text
      prevent_mutation: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      protect_country_resale: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      protect_critical_settings: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      protect_profile_admin_columns: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      protect_rental_columns: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      protect_ticket_columns: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
      set_updated_at: { Args: Record<string, unknown>; Returns: unknown; }; // () → trigger
    };
    Enums: {
      account_status: "active" | "suspended" | "blocked" | "deleted";
      app_role: "customer" | "support" | "admin" | "superadmin";
      call_status: "queued" | "ringing" | "in_progress" | "completed" | "busy" | "no_answer" | "failed" | "cancelled";
      comm_direction: "inbound" | "outbound";
      content_status: "draft" | "published" | "archived";
      job_status: "pending" | "processing" | "completed" | "failed" | "cancelled";
      margin_type: "percent" | "fixed";
      message_status: "queued" | "sending" | "sent" | "delivered" | "undelivered" | "failed" | "received" | "blocked";
      notification_channel: "in_app" | "email";
      number_type_code: "local" | "mobile" | "toll_free" | "national" | "shared_cost" | "voip";
      order_item_type: "purchase" | "rental" | "renewal";
      order_status: "draft" | "pending_payment" | "payment_processing" | "paid" | "provisioning" | "completed" | "failed" | "cancelled" | "refunded" | "partially_refunded";
      payment_status: "pending" | "processing" | "succeeded" | "failed" | "cancelled" | "refunded" | "partially_refunded";
      phone_number_source: "twilio_available" | "twilio_owned" | "manual";
      phone_number_status: "available" | "synchronizing" | "reserved" | "provisioning" | "active" | "suspended" | "expired" | "releasing" | "released" | "error";
      price_period: "one_time" | "monthly" | "yearly";
      price_source: "twilio_pricing_api" | "manual" | "rule";
      provider_name: "twilio" | "stripe" | "internal";
      refund_status: "requested" | "approved" | "processing" | "succeeded" | "failed" | "rejected";
      rental_kind: "purchase" | "rental";
      rental_status: "pending" | "active" | "grace_period" | "expiring" | "expired" | "cancelled" | "releasing" | "released" | "failed";
      subscription_status: "incomplete" | "active" | "past_due" | "cancelled" | "ended";
      ticket_author_kind: "customer" | "staff" | "system";
      ticket_priority: "low" | "normal" | "high" | "urgent";
      ticket_status: "open" | "pending_customer" | "pending_support" | "resolved" | "closed";
      webhook_processing_status: "received" | "processing" | "processed" | "failed" | "ignored";
      webhook_status: "active" | "paused" | "disabled";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];
