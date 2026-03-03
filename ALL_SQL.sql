create table public.app_user (
  user_id uuid not null,
  first_name character varying null,
  last_name character varying null,
  role character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  username character varying(50) null,
  constraint app_user_pkey primary key (user_id),
  constraint app_user_username_key unique (username)
) TABLESPACE pg_default;

create trigger trg_set_timestamp_user BEFORE
update on app_user for EACH row
execute FUNCTION auto_update_timestamp ();

create table public.current_stock (
  serial_no character varying not null,
  condition character varying null,
  location_id character varying null,
  status character varying null default 'Available'::character varying,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint current_stock_pkey primary key (serial_no),
  constraint fk_stock_location foreign KEY (location_id) references location (location_id),
  constraint fk_stock_part_obj foreign KEY (serial_no) references part_obj (serial_no)
) TABLESPACE pg_default;

create trigger trg_set_timestamp_stock BEFORE
update on current_stock for EACH row
execute FUNCTION auto_update_timestamp ();

create table public.customer (
  customer_id character varying not null,
  name character varying null,
  contract_info character varying null,
  address text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint customer_pkey primary key (customer_id)
) TABLESPACE pg_default;

create table public.driver (
  driver_id uuid not null default gen_random_uuid (),
  driver_name character varying not null,
  driver_phone character varying null,
  provider_id character varying not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint driver_pkey primary key (driver_id),
  constraint fk_driver_provider foreign KEY (provider_id) references logistics_provider (provider_id)
) TABLESPACE pg_default;

create table public.inbound_detail (
  in_detail_id uuid not null default gen_random_uuid (),
  inbound_id character varying null,
  serial_no character varying null,
  condition character varying null,
  damage_image_url text null,
  inspector_user_id uuid null,
  time_received_by timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint inbound_detail_pkey primary key (in_detail_id),
  constraint fk_in_detail_order foreign KEY (inbound_id) references inbound_order (inbound_id),
  constraint fk_in_detail_part_obj foreign KEY (serial_no) references part_obj (serial_no),
  constraint fk_in_detail_user foreign KEY (inspector_user_id) references app_user (user_id)
) TABLESPACE pg_default;

create trigger trg_inbound_stock_update
after INSERT on inbound_detail for EACH row
execute FUNCTION process_inbound_stock ();

create table public.inbound_order (
  inbound_id character varying not null,
  invoice_no character varying null,
  arrival_date date null,
  status character varying null,
  container_no character varying null,
  provider_id character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint inbound_order_pkey primary key (inbound_id),
  constraint fk_inbound_provider foreign KEY (provider_id) references logistics_provider (provider_id)
) TABLESPACE pg_default;

create trigger trg_set_inbound_id BEFORE INSERT on inbound_order for EACH row
execute FUNCTION generate_inbound_id ();

create trigger trg_set_timestamp_inbound BEFORE
update on inbound_order for EACH row
execute FUNCTION auto_update_timestamp ();

create table public.inbound_plan (
  plan_id uuid not null default gen_random_uuid (),
  inbound_id character varying null,
  part_id character varying null,
  expected_qty integer null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint inbound_plan_pkey primary key (plan_id),
  constraint fk_plan_order foreign KEY (inbound_id) references inbound_order (inbound_id),
  constraint fk_plan_part foreign KEY (part_id) references part_master (part_id)
) TABLESPACE pg_default;

create table public.location (
  location_id character varying not null,
  zone_type character varying null,
  pick_sequence integer null,
  max_capacity integer null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint location_pkey primary key (location_id)
) TABLESPACE pg_default;

create table public.logistics_provider (
  provider_id character varying not null,
  company_name character varying null,
  contact_person character varying null,
  phone character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint logistics_provider_pkey primary key (provider_id)
) TABLESPACE pg_default;

create table public.outbound_detail (
  out_detail_id uuid not null default gen_random_uuid (),
  outbound_id character varying null,
  serial_no character varying null,
  picker_user_id uuid null,
  time_picked_by timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint outbound_detail_pkey primary key (out_detail_id),
  constraint fk_out_detail_order foreign KEY (outbound_id) references outbound_order (outbound_id),
  constraint fk_out_detail_part_obj foreign KEY (serial_no) references part_obj (serial_no),
  constraint fk_out_detail_user foreign KEY (picker_user_id) references app_user (user_id)
) TABLESPACE pg_default;

create trigger trg_outbound_stock_update
after INSERT on outbound_detail for EACH row
execute FUNCTION process_outbound_stock ();

create table public.outbound_order (
  outbound_id character varying not null,
  order_date date null,
  outstatus character varying null,
  pod_status character varying null,
  pod_signature_image text null,
  pod_timestamp timestamp with time zone null,
  customer_id character varying null,
  shipment_id character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint outbound_order_pkey primary key (outbound_id),
  constraint fk_out_order_customer foreign KEY (customer_id) references customer (customer_id),
  constraint fk_out_order_shipment foreign KEY (shipment_id) references shipment (shipment_id)
) TABLESPACE pg_default;

create trigger trg_set_outbound_id BEFORE INSERT on outbound_order for EACH row
execute FUNCTION generate_outbound_id ();

create trigger trg_set_timestamp_outbound BEFORE
update on outbound_order for EACH row
execute FUNCTION auto_update_timestamp ();

create table public.part_master (
  part_id character varying not null,
  part_name character varying null,
  uom character varying null,
  weight_kg numeric null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint part_master_pkey primary key (part_id)
) TABLESPACE pg_default;

create table public.part_obj (
  serial_no character varying not null,
  part_id character varying null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint part_obj_pkey primary key (serial_no),
  constraint fk_part_obj_master foreign KEY (part_id) references part_master (part_id)
) TABLESPACE pg_default;

create table public.shipment (
  shipment_id character varying not null,
  license_plate character varying null,
  depart_time timestamp with time zone null,
  driver_id uuid null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint shipment_pkey primary key (shipment_id),
  constraint fk_shipment_driver foreign KEY (driver_id) references driver (driver_id)
) TABLESPACE pg_default;

create trigger trg_set_shipment_id BEFORE INSERT on shipment for EACH row
execute FUNCTION generate_shipment_id ();

create trigger trg_set_timestamp_shipment BEFORE
update on shipment for EACH row
execute FUNCTION auto_update_timestamp ();

create view public.vw_current_stock_details as
select
  cs.serial_no,
  pm.part_id,
  pm.part_name,
  pm.uom,
  cs.condition,
  cs.status,
  loc.location_id,
  loc.zone_type,
  cs.created_at as stock_in_date,
  cs.updated_at as last_updated
from
  current_stock cs
  join part_obj po on cs.serial_no::text = po.serial_no::text
  join part_master pm on po.part_id::text = pm.part_id::text
  left join location loc on cs.location_id::text = loc.location_id::text;

  CREATE TABLE public.outbound_plan (
  plan_id uuid not null default gen_random_uuid (),
  outbound_id character varying null,
  part_id character varying null,
  expected_qty integer null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint outbound_plan_pkey primary key (plan_id),
  constraint fk_outplan_order foreign KEY (outbound_id) references outbound_order (outbound_id),
  constraint fk_outplan_part foreign KEY (part_id) references part_master (part_id)
);
