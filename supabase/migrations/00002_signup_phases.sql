-- =============================================================================
-- Three-phase lunch sign-up windows
-- Club defaults + per-lunch absolute timestamps; RPCs enforce the phases.
-- =============================================================================

alter table clubs
  add column committee_priority_days int not null default 2
    check (committee_priority_days >= 0),
  add column members_only_days int not null default 14
    check (members_only_days >= 0),
  add column guests_phase_days int not null default 14
    check (guests_phase_days >= 0);

comment on column clubs.committee_priority_days is
  'Days after signup_opens_at before all active members may sign up.';
comment on column clubs.members_only_days is
  'Days after members_open_at before members may add guests.';
comment on column clubs.guests_phase_days is
  'Days after guests_open_at until the existing signup cutoff (used to derive default opens).';

alter table lunches
  add column signup_opens_at timestamptz,
  add column members_open_at timestamptz,
  add column guests_open_at timestamptz;

comment on column lunches.signup_opens_at is
  'First moment anyone may sign up. Null = legacy: open once released.';
comment on column lunches.members_open_at is
  'After this, all active members may sign up. Null = no committee-only window.';
comment on column lunches.guests_open_at is
  'After this, members may add guests (if the lunch/club allows). Null = guests follow guests_allowed immediately.';

-- Fill cutoff where a released/dated lunch never had one, then derive phases
-- backwards from cutoff using club defaults (UTC, matching app release logic).
update lunches l
set signup_cutoff_at =
  ((l.lunch_date + l.start_time) at time zone 'utc')
  - (c.signup_cutoff_days * interval '1 day')
from clubs c
where c.id = l.club_id
  and l.signup_cutoff_at is null;

update lunches l
set
  guests_open_at = l.signup_cutoff_at - (c.guests_phase_days * interval '1 day'),
  members_open_at =
    l.signup_cutoff_at
    - (c.guests_phase_days * interval '1 day')
    - (c.members_only_days * interval '1 day'),
  signup_opens_at =
    l.signup_cutoff_at
    - (c.guests_phase_days * interval '1 day')
    - (c.members_only_days * interval '1 day')
    - (c.committee_priority_days * interval '1 day')
from clubs c
where c.id = l.club_id
  and l.signup_cutoff_at is not null
  and l.signup_opens_at is null;

-- Upcoming released lunch that has opened and not yet hit cutoff.
create or replace function public.next_open_lunch_id(p_club uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select l.id
  from lunches l
  where l.club_id = p_club
    and l.status = 'released'
    and l.lunch_date >= current_date
    and (l.signup_opens_at is null or l.signup_opens_at <= now())
    and (l.signup_cutoff_at is null or now() < l.signup_cutoff_at)
  order by l.lunch_date, l.start_time
  limit 1;
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
  v_is_committee boolean;
  v_next uuid;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null then raise exception 'Lunch not found'; end if;
  if v_lunch.status <> 'released' then raise exception 'Sign-ups are not open for this lunch'; end if;
  if v_lunch.signup_cutoff_at is not null and now() >= v_lunch.signup_cutoff_at then
    raise exception 'The sign-up cutoff for this lunch has passed';
  end if;

  select * into v_club from clubs where id = v_lunch.club_id;
  select * into v_membership from memberships
    where club_id = v_lunch.club_id and user_id = auth.uid() and status = 'active';
  if v_membership is null then raise exception 'You are not an active member of this club'; end if;

  v_is_committee := v_membership.role = 'committee';

  if not v_is_committee then
    if v_lunch.signup_opens_at is not null and now() < v_lunch.signup_opens_at then
      raise exception 'Sign-ups are not yet open for this lunch';
    end if;
    if v_lunch.members_open_at is not null and now() < v_lunch.members_open_at then
      raise exception 'Committee priority is in effect';
    end if;

    v_next := next_open_lunch_id(v_lunch.club_id);
    if v_next is not null and v_next is distinct from p_lunch then
      raise exception 'You may only add your name to the next luncheon that is currently open';
    end if;
  end if;

  v_guests_allowed := coalesce(v_lunch.guests_allowed, v_club.guests_allowed);
  v_max_guests := coalesce(v_lunch.max_guests_per_member, v_club.max_guests_per_member);
  if p_guest_count < 0 then raise exception 'Invalid guest count'; end if;
  if p_guest_count > 0 and not v_guests_allowed then
    raise exception 'Guests are not allowed for this lunch';
  end if;
  if p_guest_count > v_max_guests then
    raise exception 'At most % guest(s) per member', v_max_guests;
  end if;
  if p_guest_count > 0
     and not v_is_committee
     and v_lunch.guests_open_at is not null
     and now() < v_lunch.guests_open_at then
    raise exception 'Guests may not be added yet';
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
  v_membership memberships%rowtype;
  v_guests_allowed boolean;
  v_max_guests int;
  v_other_seats int;
  v_result signups%rowtype;
  v_is_committee boolean;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null or v_lunch.status <> 'released' then
    raise exception 'Sign-ups are not open for this lunch';
  end if;
  if v_lunch.signup_cutoff_at is not null and now() >= v_lunch.signup_cutoff_at then
    raise exception 'The sign-up cutoff for this lunch has passed';
  end if;

  select * into v_membership from memberships
    where club_id = v_lunch.club_id and user_id = auth.uid() and status = 'active';
  if v_membership is null then raise exception 'You are not an active member of this club'; end if;
  v_is_committee := v_membership.role = 'committee';

  select s.* into v_signup from signups s
    where s.lunch_id = p_lunch and s.membership_id = v_membership.id
      and s.status in ('confirmed', 'waitlisted');
  if v_signup is null then raise exception 'You are not signed up for this lunch'; end if;

  select * into v_club from clubs where id = v_lunch.club_id;
  v_guests_allowed := coalesce(v_lunch.guests_allowed, v_club.guests_allowed);
  v_max_guests := coalesce(v_lunch.max_guests_per_member, v_club.max_guests_per_member);
  if p_guest_count < 0 or p_guest_count > v_max_guests
     or (p_guest_count > 0 and not v_guests_allowed) then
    raise exception 'Invalid guest count (max % per member)', v_max_guests;
  end if;

  if p_guest_count > v_signup.guest_count
     and not v_is_committee
     and v_lunch.guests_open_at is not null
     and now() < v_lunch.guests_open_at then
    raise exception 'Guests may not be added yet';
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
