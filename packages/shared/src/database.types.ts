export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address_line: string
          city: string
          city_id: string | null
          commune: string
          created_at: string
          id: string
          is_primary: boolean
          label: string
          landmark: string | null
          phone: string
          quartier: string | null
          quartier_id: string | null
          recipient_name: string
          shop_photo_path: string | null
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          address_line: string
          city?: string
          city_id?: string | null
          commune: string
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string
          landmark?: string | null
          phone: string
          quartier?: string | null
          quartier_id?: string | null
          recipient_name: string
          shop_photo_path?: string | null
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          address_line?: string
          city?: string
          city_id?: string | null
          commune?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string
          landmark?: string | null
          phone?: string
          quartier?: string | null
          quartier_id?: string | null
          recipient_name?: string
          shop_photo_path?: string | null
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "address_zone_city_fk"
            columns: ["zone_id", "city_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id", "city_id"]
          },
          {
            foreignKeyName: "addresses_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_quartier_id_fkey"
            columns: ["quartier_id"]
            isOneToOne: false
            referencedRelation: "delivery_quartiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_alert_reads: {
        Row: {
          alert_key: string
          read_at: string
          user_id: string
        }
        Insert: {
          alert_key: string
          read_at?: string
          user_id: string
        }
        Update: {
          alert_key?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string
          entity_type: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id: string
          entity_type: string
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string
          entity_type?: string
          id?: never
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          currency: string
          delivery_fee_gnf: number
          free_delivery_from_units: number
          id: boolean
          maintenance: boolean
          minimum_order_units: number
          orders_enabled: boolean
          service_communes: string[]
          updated_at: string
        }
        Insert: {
          currency?: string
          delivery_fee_gnf: number
          free_delivery_from_units?: number
          id?: boolean
          maintenance?: boolean
          minimum_order_units?: number
          orders_enabled?: boolean
          service_communes: string[]
          updated_at?: string
        }
        Update: {
          currency?: string
          delivery_fee_gnf?: number
          free_delivery_from_units?: number
          id?: boolean
          maintenance?: boolean
          minimum_order_units?: number
          orders_enabled?: boolean
          service_communes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          actor_id: string
          audience: string
          body: string
          created_at: string
          customer_id: string | null
          id: string
          recipient_count: number
          sent_at: string | null
          status: string
          title: string
        }
        Insert: {
          actor_id: string
          audience: string
          body: string
          created_at?: string
          customer_id?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string | null
          status?: string
          title: string
        }
        Update: {
          actor_id?: string
          audience?: string
          body?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      cities: {
        Row: {
          active: boolean
          id: string
          name: string
          slug: string
          timezone: string
        }
        Insert: {
          active?: boolean
          id?: string
          name: string
          slug: string
          timezone?: string
        }
        Update: {
          active?: boolean
          id?: string
          name?: string
          slug?: string
          timezone?: string
        }
        Relationships: []
      }
      city_delivery_rules: {
        Row: {
          city_id: string
          free_category_id: string | null
          free_from_quantity: number | null
          free_unit: string | null
        }
        Insert: {
          city_id: string
          free_category_id?: string | null
          free_from_quantity?: number | null
          free_unit?: string | null
        }
        Update: {
          city_id?: string
          free_category_id?: string | null
          free_from_quantity?: number | null
          free_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_delivery_rules_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_delivery_rules_free_category_id_fkey"
            columns: ["free_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      city_offers: {
        Row: {
          active: boolean
          availability_mode: string
          city_id: string
          id: string
          price_gnf: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          active?: boolean
          availability_mode?: string
          city_id: string
          id?: string
          price_gnf: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          active?: boolean
          availability_mode?: string
          city_id?: string
          id?: string
          price_gnf?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_offers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_offers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          id: boolean
          name: string
          support_email: string | null
          support_phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          id?: boolean
          name?: string
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          id?: boolean
          name?: string
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_communes: {
        Row: {
          active: boolean
          fee_gnf: number
          id: string
          name: string
          zone_id: string
        }
        Insert: {
          active?: boolean
          fee_gnf: number
          id?: string
          name: string
          zone_id: string
        }
        Update: {
          active?: boolean
          fee_gnf?: number
          id?: string
          name?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_communes_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_days: {
        Row: {
          active: boolean
          capacity_orders: number
          created_at: string
          delivery_date: string
          id: string
          order_cutoff_at: string
        }
        Insert: {
          active?: boolean
          capacity_orders: number
          created_at?: string
          delivery_date: string
          id?: string
          order_cutoff_at: string
        }
        Update: {
          active?: boolean
          capacity_orders?: number
          created_at?: string
          delivery_date?: string
          id?: string
          order_cutoff_at?: string
        }
        Relationships: []
      }
      delivery_drivers: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          phone: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          phone: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          phone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      delivery_quartiers: {
        Row: {
          active: boolean
          commune_id: string
          fee_gnf: number | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          commune_id: string
          fee_gnf?: number | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          commune_id?: string
          fee_gnf?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_quartiers_commune_id_fkey"
            columns: ["commune_id"]
            isOneToOne: false
            referencedRelation: "delivery_communes"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_recurrence: {
        Row: {
          active: boolean
          capacity_orders: number
          city_id: string
          cutoff_hours: number
          end_time: string
          horizon_days: number
          last_generated_at: string | null
          show_hours: boolean
          start_time: string
          weekdays: number[]
        }
        Insert: {
          active?: boolean
          capacity_orders?: number
          city_id: string
          cutoff_hours?: number
          end_time?: string
          horizon_days?: number
          last_generated_at?: string | null
          show_hours?: boolean
          start_time?: string
          weekdays?: number[]
        }
        Update: {
          active?: boolean
          capacity_orders?: number
          city_id?: string
          cutoff_hours?: number
          end_time?: string
          horizon_days?: number
          last_generated_at?: string | null
          show_hours?: boolean
          start_time?: string
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "delivery_recurrence_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_schedule_days: {
        Row: {
          active: boolean
          capacity_orders: number
          city_id: string
          delivery_date: string
          show_hours: boolean
        }
        Insert: {
          active?: boolean
          capacity_orders?: number
          city_id: string
          delivery_date: string
          show_hours?: boolean
        }
        Update: {
          active?: boolean
          capacity_orders?: number
          city_id?: string
          delivery_date?: string
          show_hours?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "delivery_schedule_days_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_slots: {
        Row: {
          active: boolean
          capacity_orders: number
          created_at: string
          cutoff_at: string
          ends_at: string
          id: string
          starts_at: string
          zone_id: string
        }
        Insert: {
          active?: boolean
          capacity_orders: number
          created_at?: string
          cutoff_at: string
          ends_at: string
          id?: string
          starts_at: string
          zone_id: string
        }
        Update: {
          active?: boolean
          capacity_orders?: number
          created_at?: string
          cutoff_at?: string
          ends_at?: string
          id?: string
          starts_at?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_slots_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          active: boolean
          city_id: string
          fee_gnf: number | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          city_id: string
          fee_gnf?: number | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          city_id?: string
          fee_gnf?: number | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_notes: {
        Row: {
          actor_id: string
          body: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          actor_id: string
          body: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          actor_id?: string
          body?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      legal_settings: {
        Row: {
          approved_at: string | null
          contact_email: string
          controller_address: string
          controller_name: string
          deletion_enabled: boolean
          id: boolean
          privacy_text: string
          retention_days: number | null
          terms_text: string
          version: string
        }
        Insert: {
          approved_at?: string | null
          contact_email?: string
          controller_address?: string
          controller_name?: string
          deletion_enabled?: boolean
          id?: boolean
          privacy_text?: string
          retention_days?: number | null
          terms_text?: string
          version?: string
        }
        Update: {
          approved_at?: string | null
          contact_email?: string
          controller_address?: string
          controller_name?: string
          deletion_enabled?: boolean
          id?: boolean
          privacy_text?: string
          retention_days?: number | null
          terms_text?: string
          version?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          marketing_push: boolean
          transactional_push: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          marketing_push?: boolean
          transactional_push?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          marketing_push?: boolean
          transactional_push?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          order_id: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          order_id?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          order_id?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          line_total_gnf: number | null
          offer_id: string | null
          order_id: string
          pack_quantity: number | null
          product_id: string
          product_name: string
          quantity: number
          unit: string
          unit_price_gnf: number
          variant_id: string | null
        }
        Insert: {
          id?: string
          line_total_gnf?: number | null
          offer_id?: string | null
          order_id: string
          pack_quantity?: number | null
          product_id: string
          product_name: string
          quantity: number
          unit: string
          unit_price_gnf: number
          variant_id?: string | null
        }
        Update: {
          id?: string
          line_total_gnf?: number | null
          offer_id?: string | null
          order_id?: string
          pack_quantity?: number | null
          product_id?: string
          product_name?: string
          quantity?: number
          unit?: string
          unit_price_gnf?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "catalog_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "city_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_offers"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_id: string | null
          created_at: string
          id: number
          order_id: string
          status: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: never
          order_id: string
          status: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: never
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_snapshot: Json
          cancellation_reason: string | null
          city_id: string | null
          created_at: string
          customer_id: string
          delivery_date: string | null
          delivery_day_id: string | null
          delivery_fee_gnf: number
          delivery_slot_id: string | null
          delivery_snapshot: Json | null
          discount_gnf: number
          driver_id: string | null
          id: string
          idempotency_key: string
          order_number: number
          payment_due_at: string | null
          payment_method: string
          promotion_id: string | null
          quote_id: string | null
          request_payload: Json
          status: string
          subtotal_gnf: number
          total_gnf: number | null
          updated_at: string
        }
        Insert: {
          address_snapshot: Json
          cancellation_reason?: string | null
          city_id?: string | null
          created_at?: string
          customer_id: string
          delivery_date?: string | null
          delivery_day_id?: string | null
          delivery_fee_gnf: number
          delivery_slot_id?: string | null
          delivery_snapshot?: Json | null
          discount_gnf?: number
          driver_id?: string | null
          id?: string
          idempotency_key: string
          order_number?: never
          payment_due_at?: string | null
          payment_method: string
          promotion_id?: string | null
          quote_id?: string | null
          request_payload: Json
          status?: string
          subtotal_gnf: number
          total_gnf?: number | null
          updated_at?: string
        }
        Update: {
          address_snapshot?: Json
          cancellation_reason?: string | null
          city_id?: string | null
          created_at?: string
          customer_id?: string
          delivery_date?: string | null
          delivery_day_id?: string | null
          delivery_fee_gnf?: number
          delivery_slot_id?: string | null
          delivery_snapshot?: Json | null
          discount_gnf?: number
          driver_id?: string | null
          id?: string
          idempotency_key?: string
          order_number?: never
          payment_due_at?: string | null
          payment_method?: string
          promotion_id?: string | null
          quote_id?: string | null
          request_payload?: Json
          status?: string
          subtotal_gnf?: number
          total_gnf?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_day_id_fkey"
            columns: ["delivery_day_id"]
            isOneToOne: false
            referencedRelation: "delivery_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_slot_id_fkey"
            columns: ["delivery_slot_id"]
            isOneToOne: false
            referencedRelation: "delivery_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "delivery_drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          code: string
          enabled: boolean
          label: string
        }
        Insert: {
          code: string
          enabled?: boolean
          label: string
        }
        Update: {
          code?: string
          enabled?: boolean
          label?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_gnf: number
          created_at: string
          currency: string
          id: string
          order_id: string
          provider: string
          provider_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_gnf: number
          created_at?: string
          currency?: string
          id?: string
          order_id: string
          provider: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_gnf?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string
          provider?: string
          provider_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string
          id: string
          product_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt_text?: string
          id?: string
          product_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt_text?: string
          id?: string
          product_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_offers"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          id: string
          minimum_quantity: number
          pack_quantity: number
          product_id: string
          quantity_step: number
          sku: string
          unit: string
        }
        Insert: {
          active?: boolean
          id?: string
          minimum_quantity?: number
          pack_quantity: number
          product_id: string
          quantity_step?: number
          sku: string
          unit: string
        }
        Update: {
          active?: boolean
          id?: string
          minimum_quantity?: number
          pack_quantity?: number
          product_id?: string
          quantity_step?: number
          sku?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_offers"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          description: string
          eggs_per_unit: number | null
          id: string
          name: string
          unit: string
          unit_price_gnf: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          description?: string
          eggs_per_unit?: number | null
          id?: string
          name: string
          unit?: string
          unit_price_gnf?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          description?: string
          eggs_per_unit?: number | null
          id?: string
          name?: string
          unit?: string
          unit_price_gnf?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_path: string | null
          business_name: string | null
          created_at: string
          first_name: string
          full_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          business_name?: string | null
          created_at?: string
          first_name?: string
          full_name?: string
          id: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          business_name?: string | null
          created_at?: string
          first_name?: string
          full_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean
          code: string | null
          created_at: string
          customer_ids: string[]
          ends_at: string
          id: string
          kind: string
          minimum_quantity: number
          name: string
          starts_at: string
          value: number
          variant_id: string | null
        }
        Insert: {
          active?: boolean
          code?: string | null
          created_at?: string
          customer_ids?: string[]
          ends_at: string
          id?: string
          kind: string
          minimum_quantity?: number
          name: string
          starts_at: string
          value: number
          variant_id?: string | null
        }
        Update: {
          active?: boolean
          code?: string | null
          created_at?: string
          customer_ids?: string[]
          ends_at?: string
          id?: string
          kind?: string
          minimum_quantity?: number
          name?: string
          starts_at?: string
          value?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_batches: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          reference: string
          request_payload: Json
          supplier_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          reference: string
          request_payload: Json
          supplier_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          reference?: string
          request_payload?: Json
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actor_id: string | null
          batch_id: string | null
          city_id: string
          created_at: string
          expected_date: string
          id: string
          quantity: number
          received_at: string | null
          received_quantity: number
          reference: string
          status: string
          supplier_id: string
          total_gnf: number | null
          unit_cost_gnf: number
          variant_id: string
        }
        Insert: {
          actor_id?: string | null
          batch_id?: string | null
          city_id: string
          created_at?: string
          expected_date: string
          id?: string
          quantity: number
          received_at?: string | null
          received_quantity?: number
          reference: string
          status?: string
          supplier_id: string
          total_gnf?: number | null
          unit_cost_gnf: number
          variant_id: string
        }
        Update: {
          actor_id?: string | null
          batch_id?: string | null
          city_id?: string
          created_at?: string
          expected_date?: string
          id?: string
          quantity?: number
          received_at?: string | null
          received_quantity?: number
          reference?: string
          status?: string
          supplier_id?: string
          total_gnf?: number | null
          unit_cost_gnf?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "purchase_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_receipts: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          note: string
          purchase_id: string
          quantity: number
        }
        Insert: {
          actor_id: string
          created_at?: string
          id: string
          note?: string
          purchase_id: string
          quantity: number
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          note?: string
          purchase_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_receipts_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          actor_id: string
          amount_gnf: number
          created_at: string
          id: string
          payment_id: string
          reason: string
          status: string
        }
        Insert: {
          actor_id: string
          amount_gnf: number
          created_at?: string
          id?: string
          payment_id: string
          reason: string
          status?: string
        }
        Update: {
          actor_id?: string
          amount_gnf?: number
          created_at?: string
          id?: string
          payment_id?: string
          reason?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          actor_id: string | null
          city_id: string
          created_at: string
          id: string
          order_id: string | null
          purchase_id: string | null
          quantity: number
          reason: string
          receipt_id: string | null
          unit_cost_gnf: number | null
          variant_id: string
        }
        Insert: {
          actor_id?: string | null
          city_id: string
          created_at?: string
          id?: string
          order_id?: string | null
          purchase_id?: string | null
          quantity: number
          reason: string
          receipt_id?: string | null
          unit_cost_gnf?: number | null
          variant_id: string
        }
        Update: {
          actor_id?: string | null
          city_id?: string
          created_at?: string
          id?: string
          order_id?: string | null
          purchase_id?: string | null
          quantity?: number
          reason?: string
          receipt_id?: string | null
          unit_cost_gnf?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: true
            referencedRelation: "purchase_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_thresholds: {
        Row: {
          city_id: string
          minimum: number
          variant_id: string
        }
        Insert: {
          city_id: string
          minimum?: number
          variant_id: string
        }
        Update: {
          city_id?: string
          minimum?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_thresholds_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_thresholds_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_offers: {
        Row: {
          available: boolean
          supplier_id: string
          unit_cost_gnf: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          available?: boolean
          supplier_id: string
          unit_cost_gnf: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          available?: boolean
          supplier_id?: string
          unit_cost_gnf?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_offers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_offers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          actor_id: string
          amount_gnf: number
          created_at: string
          id: string
          method: string
          paid_at: string
          purchase_id: string
          reference: string
        }
        Insert: {
          actor_id: string
          amount_gnf: number
          created_at?: string
          id: string
          method: string
          paid_at: string
          purchase_id: string
          reference: string
        }
        Update: {
          actor_id?: string
          amount_gnf?: number
          created_at?: string
          id?: string
          method?: string
          paid_at?: string
          purchase_id?: string
          reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          product_id: string
          purchase_price_gnf: number
          supplier_id: string
        }
        Insert: {
          product_id: string
          purchase_price_gnf: number
          supplier_id: string
        }
        Update: {
          product_id?: string
          purchase_price_gnf?: number
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_offers"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "supplier_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          contact_name: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          contact_name?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      support_cases: {
        Row: {
          actor_id: string | null
          body: string
          category: string
          created_at: string
          customer_id: string | null
          id: string
          order_id: string | null
          severity: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          actor_id?: string | null
          body: string
          category: string
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
          severity?: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          actor_id?: string | null
          body?: string
          category?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          order_id?: string | null
          severity?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_cases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          order_id: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          order_id?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
          sender_type: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      catalog_offers: {
        Row: {
          availability_mode: string | null
          category_id: string | null
          category_name: string | null
          category_slug: string | null
          city_id: string | null
          description: string | null
          id: string | null
          minimum_quantity: number | null
          name: string | null
          pack_quantity: number | null
          price_gnf: number | null
          product_id: string | null
          quantity_step: number | null
          sku: string | null
          unit: string | null
          variant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "city_offers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "city_offers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_order_options: {
        Args: { p_customer: string; p_query: string }
        Returns: Json
      }
      admin_place_order: {
        Args: { p_idempotency_key: string; p_quote_id: string }
        Returns: string
      }
      admin_quote: {
        Args: {
          p_address: string
          p_customer: string
          p_items: Json
          p_method: string
          p_slot: string
        }
        Returns: Json
      }
      bind_driver: {
        Args: { p_driver: string; p_email: string }
        Returns: undefined
      }
      cancel_unpaid_order: { Args: { p_order_id: string }; Returns: undefined }
      catalogue_manage: {
        Args: { p_data: Json; p_kind: string }
        Returns: undefined
      }
      change_order_status: {
        Args: { p_order_id: string; p_status: string }
        Returns: undefined
      }
      checkout_options: { Args: { p_city_id: string }; Returns: Json }
      claim_owner_access: { Args: never; Returns: undefined }
      claim_staff_invitation: { Args: never; Returns: undefined }
      commerce_write: {
        Args: { p_data: Json; p_kind: string }
        Returns: undefined
      }
      company_settings_save: {
        Args: {
          p_address: string
          p_email: string
          p_maintenance: boolean
          p_name: string
          p_phone: string
        }
        Returns: undefined
      }
      control_alerts: { Args: never; Returns: Json }
      control_analytics_detail: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      control_audit: {
        Args: { p_page: number; p_query: string }
        Returns: Json
      }
      control_bulk: {
        Args: { p_action: string; p_driver?: string; p_items: Json }
        Returns: number
      }
      control_calendar: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      control_clients: { Args: { p_filter: Json }; Returns: Json }
      control_customer: { Args: { p_id: string }; Returns: Json }
      control_dashboard: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      control_delivery_metrics: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      control_finance: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      control_inventory: { Args: never; Returns: Json }
      control_margin: {
        Args: { p_end: string; p_start: string }
        Returns: Json
      }
      control_orders: { Args: { p_filter: Json }; Returns: Json }
      control_payment_health: { Args: never; Returns: Json }
      control_payment_review: { Args: { p_page?: number }; Returns: Json }
      control_preparation: { Args: { p_date: string }; Returns: Json }
      control_search: { Args: { p_query: string }; Returns: Json }
      control_supplier_summary: { Args: { p_supplier: string }; Returns: Json }
      control_team: { Args: never; Returns: Json }
      control_team_write: {
        Args: { p_active: boolean; p_email: string; p_role: string }
        Returns: undefined
      }
      control_write: {
        Args: { p_data: Json; p_kind: string }
        Returns: undefined
      }
      create_delivery_slot: {
        Args: {
          p_active: boolean
          p_capacity: number
          p_cutoff_hours: number
          p_date: string
          p_end: string
          p_start: string
          p_zone_id: string
        }
        Returns: string
      }
      current_user_is_admin: { Args: never; Returns: boolean }
      driver_orders: { Args: { p_date: string }; Returns: Json }
      guard_active_account: { Args: never; Returns: undefined }
      has_permission: { Args: { p_permission: string }; Returns: boolean }
      invite_staff: {
        Args: {
          p_email: string
          p_name: string
          p_phone: string
          p_role: string
        }
        Returns: string
      }
      manage_delivery_day: {
        Args: {
          p_active: boolean
          p_capacity: number
          p_city_id: string
          p_date: string
          p_show_hours: boolean
        }
        Returns: undefined
      }
      manage_delivery_zone: {
        Args: {
          p_active: boolean
          p_city_id: string
          p_fee: number
          p_id: string
          p_name: string
        }
        Returns: string
      }
      manage_locality: {
        Args: {
          p_active: boolean
          p_fee: number
          p_id: string
          p_kind: string
          p_name: string
          p_parent: string
        }
        Returns: string
      }
      manage_my_address: {
        Args: { p_action: string; p_id: string }
        Returns: undefined
      }
      notify_selected_orders: {
        Args: { p_body: string; p_ids: string[]; p_title: string }
        Returns: number
      }
      operations_overview: { Args: never; Returns: Json }
      operations_write: {
        Args: { p_data: Json; p_kind: string }
        Returns: undefined
      }
      pending_staff_invitations: { Args: never; Returns: Json }
      place_checkout_order: {
        Args: { p_idempotency_key: string; p_quote_id: string }
        Returns: string
      }
      place_order: {
        Args: {
          p_address_id: string
          p_delivery_day_id: string
          p_idempotency_key: string
          p_items: Json
          p_payment_method: string
        }
        Returns: string
      }
      procurement_write: {
        Args: { p_action: string; p_data: Json }
        Returns: string
      }
      quote_checkout: {
        Args: {
          p_address_id: string
          p_items: Json
          p_method: string
          p_slot_id: string
        }
        Returns: Json
      }
      record_staff_session: { Args: never; Returns: undefined }
      reorder_details: { Args: { p_order: string }; Returns: Json }
      resolve_conversation: { Args: { p_id: string }; Returns: undefined }
      save_delivery_address: {
        Args: {
          p_id: string
          p_landmark: string
          p_line: string
          p_name: string
          p_phone: string
          p_zone_id: string
        }
        Returns: string
      }
      save_delivery_address_details: {
        Args: {
          p_commune: string
          p_id: string
          p_landmark: string
          p_line: string
          p_name: string
          p_phone: string
          p_quartier: string
          p_zone_id: string
        }
        Returns: string
      }
      save_delivery_recurrence: {
        Args: { p_city: string; p_data: Json }
        Returns: undefined
      }
      save_delivery_slot: {
        Args: {
          p_active: boolean
          p_cutoff_hours: number
          p_date: string
          p_end: string
          p_id: string
          p_start: string
          p_zone_id: string
        }
        Returns: string
      }
      save_legal_settings: { Args: { p_data: Json }; Returns: undefined }
      save_local_address: {
        Args: {
          p_id: string
          p_landmark: string
          p_line: string
          p_name: string
          p_phone: string
          p_quartier: string
        }
        Returns: string
      }
      save_my_profile: {
        Args: {
          p_avatar?: string
          p_first: string
          p_last: string
          p_phone: string
        }
        Returns: undefined
      }
      select_promotion: { Args: { p_code: string }; Returns: undefined }
      send_support_message: {
        Args: { p_body: string; p_conversation: string }
        Returns: undefined
      }
      server_claim_push: { Args: { p_limit?: number }; Returns: Json }
      server_claim_reconciliation: {
        Args: { p_provider: string }
        Returns: Json
      }
      server_finish_account_deletion: {
        Args: { p_user: string }
        Returns: undefined
      }
      server_finish_push: {
        Args: {
          p_error?: string
          p_id: string
          p_lease: string
          p_state: string
          p_ticket?: string
        }
        Returns: undefined
      }
      server_finish_reconciliation: {
        Args: { p_attempt: string; p_error?: string; p_lease: string }
        Returns: undefined
      }
      server_pending_account_deletions: { Args: never; Returns: Json }
      server_prepare_account_deletion: {
        Args: { p_user: string }
        Returns: Json
      }
      server_reserve_payment: {
        Args: { p_create: boolean; p_customer: string; p_order: string }
        Returns: Json
      }
      server_settle_payment: {
        Args: {
          p_amount: number
          p_attempt: string
          p_currency: string
          p_provider: string
          p_reference: string
          p_status: string
        }
        Returns: string
      }
      set_address_label: {
        Args: { p_id: string; p_label: string }
        Returns: undefined
      }
      set_address_photo: {
        Args: { p_address: string; p_path: string }
        Returns: undefined
      }
      set_delivery_slot_active: {
        Args: { p_active: boolean; p_id: string }
        Returns: undefined
      }
      set_staff_permission: {
        Args: { p_allowed: boolean; p_permission: string; p_user: string }
        Returns: undefined
      }
      staff_access: { Args: never; Returns: Json }
      staff_invitation_control: {
        Args: { p_action: string; p_id: string }
        Returns: string
      }
      staff_permissions: { Args: { p_user?: string }; Returns: Json }
      start_conversation: {
        Args: { p_body: string; p_order?: string; p_subject: string }
        Returns: string
      }
      supplier_offer_save: {
        Args: {
          p_available: boolean
          p_cost: number
          p_supplier: string
          p_variant: string
        }
        Returns: undefined
      }
      update_delivery_fee: {
        Args: { p_expected_fee: number; p_fee: number; p_reason: string }
        Returns: undefined
      }
      update_offer_price: {
        Args: {
          p_expected_price: number
          p_offer_id: string
          p_price: number
          p_reason: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
