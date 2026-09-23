-- =============================================================================
-- Lunch critique speaking roles (Food 1 / Food 2 / Wine 1 / Wine 2)
-- Committee assigns one confirmed attendee per role. One role per person.
-- Writes go through SECURITY DEFINER functions — no direct write policies.
-- =============================================================================

create type lunch_critique_role as enum ('food_1', 'food_2', 'wine_1', 'wine_2');

create table lunch_roles (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references clubs(id) on delete cascade,
  lunch_id uuid not null references lunches(id) on delete cascade,
  role lunch_critique_role not null,
  membership_id uuid not null references memberships(id) on delete cascade,
  assigned_by uuid references memberships(id) on delete set null,
  assigned_at timestamptz not null default now(),
  notified_at timestamptz,
  unique (lunch_id, role),
  unique (lunch_id, membership_id)
);
create index lunch_roles_lunch_idx on lunch_roles (lunch_id);
create index lunch_roles_membership_idx on lunch_roles (membership_id);

comment on table lunch_roles is
  'Per-lunch speaking roles. One person per role; one role per person.';

alter table lunch_roles enable row level security;

-- Members read roles on lunches they can already see; committee sees drafts too.
create policy lunch_roles_select on lunch_roles for select using (
  is_committee_of(club_id)
  or (
    is_member_of(club_id)
    and exists (
      select 1 from lunches l
      where l.id = lunch_id and l.club_id = lunch_roles.club_id and l.status <> 'draft'
    )
  )
);

-- Drop the role if the holder is no longer a confirmed attendee.
create or replace function public.lunch_roles_clear_if_unconfirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    delete from lunch_roles
      where lunch_id = old.lunch_id and membership_id = old.membership_id;
    return old;
  end if;
  if new.status is distinct from 'confirmed' then
    delete from lunch_roles
      where lunch_id = new.lunch_id and membership_id = new.membership_id;
  end if;
  return new;
end;
$$;

create trigger signups_clear_lunch_roles
  after update of status or delete on signups
  for each row execute function public.lunch_roles_clear_if_unconfirmed();

revoke execute on function public.lunch_roles_clear_if_unconfirmed() from public, anon, authenticated;

create or replace function public.assign_lunch_role(
  p_lunch uuid,
  p_role lunch_critique_role,
  p_membership uuid
) returns lunch_roles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lunch lunches%rowtype;
  v_membership memberships%rowtype;
  v_assigner uuid;
  v_held lunch_roles%rowtype;
  v_slot lunch_roles%rowtype;
  v_result lunch_roles%rowtype;
begin
  select * into v_lunch from lunches where id = p_lunch for update;
  if v_lunch is null then raise exception 'Lunch not found'; end if;
  if not is_committee_of(v_lunch.club_id) then raise exception 'Committee only'; end if;
  if v_lunch.status = 'cancelled' then
    raise exception 'You cannot assign a speaking role on a cancelled lunch';
  end if;

  select * into v_membership from memberships where id = p_membership;
  if v_membership is null or v_membership.club_id is distinct from v_lunch.club_id then
    raise exception 'Member not found';
  end if;

  if not exists (
    select 1 from signups
    where lunch_id = p_lunch
      and membership_id = p_membership
      and status = 'confirmed'
  ) then
    raise exception 'Only confirmed attendees may be assigned a speaking role';
  end if;

  select m.id into v_assigner from memberships m
    where m.club_id = v_lunch.club_id and m.user_id = auth.uid() and m.status = 'active';

  select * into v_held from lunch_roles
    where lunch_id = p_lunch and membership_id = p_membership;
  if v_held.id is not null and v_held.role is distinct from p_role then
    raise exception 'That member already holds another speaking role for this lunch';
  end if;

  select * into v_slot from lunch_roles
    where lunch_id = p_lunch and role = p_role
    for update;

  if v_slot.id is not null then
    if v_slot.membership_id = p_membership then
      return v_slot;
    end if;
    update lunch_roles
      set membership_id = p_membership,
          assigned_by = v_assigner,
          assigned_at = now(),
          notified_at = now()
      where id = v_slot.id
      returning * into v_result;
    return v_result;
  end if;

  insert into lunch_roles (
    club_id, lunch_id, role, membership_id, assigned_by, notified_at
  ) values (
    v_lunch.club_id, p_lunch, p_role, p_membership, v_assigner, now()
  )
  returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.clear_lunch_role(
  p_lunch uuid,
  p_role lunch_critique_role
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_club uuid;
begin
  select club_id into v_club from lunches where id = p_lunch;
  if v_club is null then raise exception 'Lunch not found'; end if;
  if not is_committee_of(v_club) then raise exception 'Committee only'; end if;
  delete from lunch_roles where lunch_id = p_lunch and role = p_role;
end;
$$;
