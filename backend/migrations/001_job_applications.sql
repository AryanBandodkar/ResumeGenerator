-- Job applications group the resumes a user saved for the same job
-- and hold the application status plus the resume that was actually used.
--
-- Ownership uses row level security, the same pattern the resumes table
-- already relies on. The API forwards the caller's JWT on every request
-- so auth.uid() resolves to the signed-in user (services/supabaseClient.js).

create table if not exists job_applications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    job_title text,
    company_name text,
    job_description text,
    selected_resume_id uuid references resumes (id) on delete set null,
    application_status text not null default 'not_applied'
        check (application_status in ('not_applied', 'applied', 'interview', 'accepted', 'rejected')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Resumes saved before this feature keep a null job_application_id and are
-- listed as ungrouped.
alter table resumes
    add column if not exists job_application_id uuid references job_applications (id) on delete set null;

create index if not exists job_applications_user_id_idx
    on job_applications (user_id);

create index if not exists resumes_job_application_id_idx
    on resumes (job_application_id);

alter table job_applications enable row level security;

drop policy if exists "Users can view their own job applications" on job_applications;
drop policy if exists "Users can create their own job applications" on job_applications;
drop policy if exists "Users can update their own job applications" on job_applications;
drop policy if exists "Users can delete their own job applications" on job_applications;

create policy "Users can view their own job applications"
    on job_applications for select
    using (auth.uid() = user_id);

create policy "Users can create their own job applications"
    on job_applications for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own job applications"
    on job_applications for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own job applications"
    on job_applications for delete
    using (auth.uid() = user_id);
