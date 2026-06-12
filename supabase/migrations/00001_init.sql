-- =============================================================================
-- Drunken Peaches — initial schema
-- Multi-tenant club lunch management. Tenant = club. Isolation via RLS.
-- Apply with: supabase db push, or paste into the Supabase SQL editor.
-- =============================================================================

-- ---------- Enums ------------------------------------------------------------

create type member_role as enum ('member', 'committee');
create type membership_status as enum ('invited', 'active', 'resigned', 'lapsed', 'removed');
create type venue_status as enum ('candidate', 'tasting', 'approved', 'rejected', 'archived');
create type tasting_outcome as enum ('pending', 'go', 'no_go');
create type lunch_status as enum ('draft', 'released', 'completed', 'cancelled');
create type signup_status as enum ('confirmed', 'waitlisted', 'cancelled');
create type wine_source as enum ('cellar', 'restaurant');

-- ---------- Tables -----------------------------------------------------------

create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  guests_allowed boolean not null default false,
  max_guests_per_member int not null default 1 check (max_guests_per_member >= 0),
  signup_cutoff_days int not null default 2 check (signup_cutoff_days >= 0),
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null default '',
  phone text,
  dietary_notes text,
  role member_role not null default 'member',
  wine_master boolean not null default false,
  status membership_status not null default 'invited',
  joined_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (club_id, email)
);
create unique index memberships_club_user_idx on memberships (club_id, user_id) where user_id is not null;
create index memberships_user_idx on memberships (user_id);

-- Venue pipeline: candidate -> tasting -> approved (-> booked lunches)
create table venues (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  name text not null,
  address text,
  contact text,
  default_capacity int check (default_capacity > 0),
  notes text,
  status venue_status not null default 'candidate',
  created_at timestamptz not null default now()
);

create table tastings (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  venue_id uuid not null references venues(id) on delete cascade,
  tasting_date date,
  feedback text,
  outcome tasting_outcome not null default 'pending',
  created_at timestamptz not null default now()
);

create table lunches (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  venue_id uuid references venues(id) on delete set null,
  title text not null,
  lunch_date date not null,
  start_time time not null default '12:30',
  -- Capacity is an input from the real-world booking, never derived from sign-ups.
  capacity int not null check (capacity >= 0),
  status lunch_status not null default 'draft',
  signup_cutoff_at timestamptz,
  guests_allowed boolean,          -- null = inherit club setting
  max_guests_per_member int,       -- null = inherit club setting
  notes text,
  released_at timestamptz,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index lunches_club_date_idx on lunches (club_id, lunch_date);

create table signups (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  lunch_id uuid not null references lunches(id) on delete cascade,
  membership_id uuid not null references memberships(id) on delete cascade,
  status signup_status not null,
  guest_count int not null default 0 check (guest_count >= 0),
  guest_names text,
  added_by_committee boolean not null default false,
  attended boolean,
  created_at timestamptz not null default now(),  -- FCFS / waitlist order
  cancelled_at timestamptz,
  unique (lunch_id, membership_id)
);
create index signups_lunch_idx on signups (lunch_id, status, created_at);

-- Lightweight wine catalogue (v1): no bottle-level inventory.
create table wines (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  name text not null,
  vintage text,
  source wine_source not null default 'cellar',
  notes text,
  created_at timestamptz not null default now()
);

-- Wine Master's selection + intended pairing for a lunch (committee-only;
-- blind tasting stays in the room — no member-facing view).
create table lunch_wines (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  lunch_id uuid not null references lunches(id) on delete cascade,
  wine_id uuid not null references wines(id) on delete cascade,
  pairing_notes text,
  created_at timestamptz not null default now(),
  unique (lunch_id, wine_id)
);

-- ---------- RLS helper functions ----------------------------------------------
-- SECURITY DEFINER so policies on memberships don't recurse.

create or replace function public.is_member_of(p_club uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.club_id = p_club and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function public.is_committee_of(p_club uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.club_id = p_club and m.user_id = auth.uid()
      and m.status = 'active' and m.role = 'committee'
  );
$$;

create or replace function public.is_wine_master_of(p_club uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.club_id = p_club and m.user_id = auth.uid()
      and m.status = 'active' and m.role = 'committee' and m.wine_master
  );
$$;

-- ---------- RLS policies -------------------------------------------------------

alter table clubs enable row level security;
alter table memberships enable row level security;
alter table venues enable row level security;
alter table tastings enable row level security;
alter table lunches enable row level security;
alter table signups enable row level security;
alter table wines enable row level security;
alter table lunch_wines enable row level security;

-- clubs: members read their clubs; committee edits settings; creation is
-- service-role only (self-serve club signup runs server-side).
create policy clubs_select on clubs for select using (is_member_of(id));
create policy clubs_update on clubs for update using (is_committee_of(id));

-- memberships: any active member can read the roster (member directory);
-- committee manages it. Self profile edits + invites go through definer
-- functions / service role so a member can never change their own role.
create policy memberships_select on memberships for select using (is_member_of(club_id));
create policy memberships_insert on memberships for insert with check (is_committee_of(club_id));
create policy memberships_update on memberships for update using (is_committee_of(club_id));
-- no delete policy: members are never hard-deleted, only marked inactive.

-- venues: members can see venues (lunch detail shows where); committee manages.
create policy venues_select on venues for select using (is_member_of(club_id));
create policy venues_write on venues for insert with check (is_committee_of(club_id));
create policy venues_update on venues for update using (is_committee_of(club_id));
create policy venues_delete on venues for delete using (is_committee_of(club_id));

-- tastings: committee-only back-of-house.
create policy tastings_all on tastings for all
  using (is_committee_of(club_id)) with check (is_committee_of(club_id));

-- lunches: members see released/completed/cancelled; committee sees drafts too.
create policy lunches_select on lunches for select using (
  is_committee_of(club_id)
  or (is_member_of(club_id) and status <> 'draft')
);
create policy lunches_insert on lunches for insert with check (is_committee_of(club_id));
create policy lunches_update on lunches for update using (is_committee_of(club_id));
create policy lunches_delete on lunches for delete
  using (is_committee_of(club_id) and status = 'draft');

-- signups: members can see who's coming (small private club); all writes go
-- through the SECURITY DEFINER functions below so capacity/waitlist/cutoff
-- rules can never be bypassed.
create policy signups_select on signups for select using (is_member_of(club_id));

-- wines + pairings: committee-only (blind tasting — members never see these).
create policy wines_all on wines for all
  using (is_committee_of(club_id)) with check (is_committee_of(club_id));
create policy lunch_wines_all on lunch_wines for all
  using (is_committee_of(club_id)) with check (is_committee_of(club_id));

-- ---------- Business-logic functions -------------------------------------------
-- All transactional sign-up/waitlist/capacity rules live here so they are
-- atomic and identical no matter which surface calls them.

-- Seats consumed by confirmed signups (member + their guests).
create or replace function public.lunch_seats_taken(p_lunch uuid)
returns int language sql stable security definer set search_path = public as $$
  select coalesce(sum(1 + guest_count), 0)::int
  from signups where lunch_id = p_lunch and status = 'confirmed';
$$;

-- Promote waitlisted signups (strict FCFS) into freed capacity.
-- Stops at the first party that doesn't fit. Returns who was promoted.
create or replace function public.promote_from_waitlist(p_lunch uuid)
returns table (membership_id uuid, email text, full_name text)
language plpgsql security definer set search_path = public as $$
declare
  v_lunch lunches%rowtype;
  v_taken int;
  v_next record;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch.status <> 'released' then return; end if;
  loop
    v_taken := lunch_seats_taken(p_lunch);
    select s.id, s.membership_id, s.guest_count, m.email, m.full_name
      into v_next
      from signups s join memberships m on m.id = s.membership_id
      where s.lunch_id = p_lunch and s.status = 'waitlisted'
      order by s.created_at
      limit 1;
    exit when v_next is null;
    exit when v_taken + 1 + v_next.guest_count > v_lunch.capacity;
    update signups set status = 'confirmed' where id = v_next.id;
    membership_id := v_next.membership_id;
    email := v_next.email;
    full_name := v_next.full_name;
    return next;
  end loop;
end;
$$;

-- Member signs themselves up (FCFS against fixed capacity; waitlist beyond).
create or replace function public.sign_up_for_lunch(
  p_lunch uuid, p_guest_count int default 0, p_guest_names text default null
) returns signups
language plpgsql security definer set search_path = public as $$
declare
  v_lunch lunches%rowtype;
  v_club clubs%rowtype;
  v_membership memberships%rowtype;
  v_existing signups%rowtype;
  v_guests_allowed boolean;
  v_max_guests int;
  v_status signup_status;
  v_result signups%rowtype;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null then raise exception 'Lunch not found'; end if;
  if v_lunch.status <> 'released' then raise exception 'Sign-ups are not open for this lunch'; end if;
  if v_lunch.signup_cutoff_at is not null and now() > v_lunch.signup_cutoff_at then
    raise exception 'The sign-up cutoff for this lunch has passed';
  end if;

  select * into v_club from clubs where id = v_lunch.club_id;
  select * into v_membership from memberships
    where club_id = v_lunch.club_id and user_id = auth.uid() and status = 'active';
  if v_membership is null then raise exception 'You are not an active member of this club'; end if;

  v_guests_allowed := coalesce(v_lunch.guests_allowed, v_club.guests_allowed);
  v_max_guests := coalesce(v_lunch.max_guests_per_member, v_club.max_guests_per_member);
  if p_guest_count < 0 then raise exception 'Invalid guest count'; end if;
  if p_guest_count > 0 and not v_guests_allowed then
    raise exception 'Guests are not allowed for this lunch';
  end if;
  if p_guest_count > v_max_guests then
    raise exception 'At most % guest(s) per member', v_max_guests;
  end if;

  select * into v_existing from signups
    where lunch_id = p_lunch and membership_id = v_membership.id;
  if v_existing.id is not null and v_existing.status <> 'cancelled' then
    raise exception 'You are already signed up for this lunch';
  end if;

  -- Guests consume seats out of the same fixed capacity.
  if lunch_seats_taken(p_lunch) + 1 + p_guest_count <= v_lunch.capacity then
    v_status := 'confirmed';
  else
    v_status := 'waitlisted';
  end if;

  if v_existing.id is not null then
    update signups
      set status = v_status, guest_count = p_guest_count, guest_names = p_guest_names,
          created_at = now(), cancelled_at = null, added_by_committee = false
      where id = v_existing.id
      returning * into v_result;
  else
    insert into signups (club_id, lunch_id, membership_id, status, guest_count, guest_names)
      values (v_lunch.club_id, p_lunch, v_membership.id, v_status, p_guest_count, p_guest_names)
      returning * into v_result;
  end if;
  return v_result;
end;
$$;

-- Member updates their own guest party size (only if the new size still fits).
create or replace function public.update_my_guests(
  p_lunch uuid, p_guest_count int, p_guest_names text default null
) returns signups
language plpgsql security definer set search_path = public as $$
declare
  v_lunch lunches%rowtype;
  v_club clubs%rowtype;
  v_signup signups%rowtype;
  v_guests_allowed boolean;
  v_max_guests int;
  v_other_seats int;
  v_result signups%rowtype;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null or v_lunch.status <> 'released' then
    raise exception 'Sign-ups are not open for this lunch';
  end if;
  if v_lunch.signup_cutoff_at is not null and now() > v_lunch.signup_cutoff_at then
    raise exception 'The sign-up cutoff for this lunch has passed';
  end if;

  select s.* into v_signup from signups s
    join memberships m on m.id = s.membership_id
    where s.lunch_id = p_lunch and m.user_id = auth.uid() and s.status in ('confirmed', 'waitlisted');
  if v_signup is null then raise exception 'You are not signed up for this lunch'; end if;

  select * into v_club from clubs where id = v_lunch.club_id;
  v_guests_allowed := coalesce(v_lunch.guests_allowed, v_club.guests_allowed);
  v_max_guests := coalesce(v_lunch.max_guests_per_member, v_club.max_guests_per_member);
  if p_guest_count < 0 or p_guest_count > v_max_guests
     or (p_guest_count > 0 and not v_guests_allowed) then
    raise exception 'Invalid guest count (max % per member)', v_max_guests;
  end if;

  if v_signup.status = 'confirmed' then
    v_other_seats := lunch_seats_taken(p_lunch) - (1 + v_signup.guest_count);
    if v_other_seats + 1 + p_guest_count > v_lunch.capacity then
      raise exception 'Not enough seats left to add that many guests';
    end if;
  end if;

  update signups set guest_count = p_guest_count, guest_names = p_guest_names
    where id = v_signup.id returning * into v_result;

  -- Shrinking a confirmed party can free seats for the waitlist.
  perform promote_from_waitlist(p_lunch);
  return v_result;
end;
$$;

-- Member cancels their own spot; frees capacity; auto-promotes the waitlist.
-- Returns whoever got promoted so the app can notify them.
create or replace function public.cancel_my_signup(p_lunch uuid)
returns table (membership_id uuid, email text, full_name text)
language plpgsql security definer set search_path = public as $$
declare
  v_lunch lunches%rowtype;
  v_signup signups%rowtype;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null then raise exception 'Lunch not found'; end if;
  if v_lunch.signup_cutoff_at is not null and now() > v_lunch.signup_cutoff_at then
    raise exception 'The cutoff has passed — contact the committee to cancel';
  end if;

  select s.* into v_signup from signups s
    join memberships m on m.id = s.membership_id
    where s.lunch_id = p_lunch and m.user_id = auth.uid() and s.status in ('confirmed', 'waitlisted');
  if v_signup is null then raise exception 'You are not signed up for this lunch'; end if;

  update signups set status = 'cancelled', cancelled_at = now() where id = v_signup.id;
  return query select * from promote_from_waitlist(p_lunch);
end;
$$;

-- Committee manually adds a member (e.g. someone phones the secretary).
-- Ignores the cutoff; p_force seats them as confirmed even beyond capacity.
create or replace function public.committee_add_signup(
  p_lunch uuid, p_membership uuid, p_guest_count int default 0, p_force boolean default false
) returns signups
language plpgsql security definer set search_path = public as $$
declare
  v_lunch lunches%rowtype;
  v_existing signups%rowtype;
  v_status signup_status;
  v_result signups%rowtype;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null then raise exception 'Lunch not found'; end if;
  if not is_committee_of(v_lunch.club_id) then raise exception 'Committee only'; end if;
  if v_lunch.status not in ('draft', 'released') then
    raise exception 'This lunch is no longer open';
  end if;

  select * into v_existing from signups
    where lunch_id = p_lunch and membership_id = p_membership;
  if v_existing.id is not null and v_existing.status <> 'cancelled' then
    raise exception 'That member is already signed up';
  end if;

  if p_force or lunch_seats_taken(p_lunch) + 1 + p_guest_count <= v_lunch.capacity then
    v_status := 'confirmed';
  else
    v_status := 'waitlisted';
  end if;

  if v_existing.id is not null then
    update signups
      set status = v_status, guest_count = p_guest_count, created_at = now(),
          cancelled_at = null, added_by_committee = true
      where id = v_existing.id returning * into v_result;
  else
    insert into signups (club_id, lunch_id, membership_id, status, guest_count, added_by_committee)
      values (v_lunch.club_id, p_lunch, p_membership, v_status, p_guest_count, true)
      returning * into v_result;
  end if;
  return v_result;
end;
$$;

-- Committee removes any signup; auto-promotes the waitlist.
create or replace function public.committee_remove_signup(p_signup uuid)
returns table (membership_id uuid, email text, full_name text)
language plpgsql security definer set search_path = public as $$
declare
  v_signup signups%rowtype;
begin
  select * into v_signup from signups where id = p_signup;
  if v_signup is null then raise exception 'Signup not found'; end if;
  if not is_committee_of(v_signup.club_id) then raise exception 'Committee only'; end if;

  update signups set status = 'cancelled', cancelled_at = now() where id = p_signup;
  return query select * from promote_from_waitlist(v_signup.lunch_id);
end;
$$;

-- Committee changes capacity after release. Raised -> auto-promote.
-- Lowered -> confirmed attendees are NEVER silently bumped; the dashboard
-- shows headcount over X and the committee resolves it by hand.
create or replace function public.set_lunch_capacity(p_lunch uuid, p_capacity int)
returns table (membership_id uuid, email text, full_name text)
language plpgsql security definer set search_path = public as $$
declare
  v_lunch lunches%rowtype;
begin
  if p_capacity < 0 then raise exception 'Capacity must be >= 0'; end if;
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null then raise exception 'Lunch not found'; end if;
  if not is_committee_of(v_lunch.club_id) then raise exception 'Committee only'; end if;

  update lunches set capacity = p_capacity where id = p_lunch;
  return query select * from promote_from_waitlist(p_lunch);
end;
$$;

-- Committee cancels the whole lunch: spots + waitlist cleared.
-- Returns everyone affected so the app can notify them.
create or replace function public.cancel_lunch(p_lunch uuid)
returns table (membership_id uuid, email text, full_name text)
language plpgsql security definer set search_path = public as $$
declare
  v_lunch lunches%rowtype;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null then raise exception 'Lunch not found'; end if;
  if not is_committee_of(v_lunch.club_id) then raise exception 'Committee only'; end if;

  return query
    select s.membership_id, m.email, m.full_name
    from signups s join memberships m on m.id = s.membership_id
    where s.lunch_id = p_lunch and s.status in ('confirmed', 'waitlisted');

  update signups set status = 'cancelled', cancelled_at = now()
    where lunch_id = p_lunch and status in ('confirmed', 'waitlisted');
  update lunches set status = 'cancelled' where id = p_lunch;
end;
$$;

-- Committee records attendance after the lunch.
create or replace function public.mark_attendance(p_signup uuid, p_attended boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_club uuid;
begin
  select club_id into v_club from signups where id = p_signup;
  if v_club is null then raise exception 'Signup not found'; end if;
  if not is_committee_of(v_club) then raise exception 'Committee only'; end if;
  update signups set attended = p_attended where id = p_signup;
end;
$$;

-- Waitlist promotion is an internal mechanism — only reachable through the
-- definer functions above (which run as the function owner), never directly.
revoke execute on function public.promote_from_waitlist(uuid) from public, anon, authenticated;

-- Member edits their own profile (never their role/status — those columns
-- are deliberately not touchable here).
create or replace function public.update_my_profile(
  p_club uuid, p_full_name text, p_phone text, p_dietary_notes text
) returns void
language plpgsql security definer set search_path = public as $$
begin
  update memberships
    set full_name = coalesce(p_full_name, full_name),
        phone = p_phone,
        dietary_notes = p_dietary_notes
    where club_id = p_club and user_id = auth.uid() and status = 'active';
  if not found then raise exception 'Membership not found'; end if;
end;
$$;
