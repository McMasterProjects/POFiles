Supabase setup and migration
===========================

This file explains how to create a Supabase project and apply the provided SQL migration that creates tables for uploads, conversions, mapping profiles, and logs.

1) Create a Supabase project
  - Sign in to https://app.supabase.com and create a new project.
  - Note the `API URL` and `Service Role` key from Project Settings → API.

2) Apply the SQL migration
Option A — use the SQL editor in the Supabase dashboard:
  - Open your project in Supabase, go to "SQL Editor", create a new query, paste the contents of `supabase/migrations/001_create_po_tables.sql`, and run it.

Option B — use psql (if you have the DB connection string):
  - From Project Settings → Database → Connection info, get the host, port, database, user, and password.
  - Run:

```bash
PGPASSWORD="<db-password>" psql -h <host> -U <db-user> -d <database> -p <port> -f supabase/migrations/001_create_po_tables.sql
```

Option C — use the Supabase CLI migrations (recommended for repeatable workflows):
  - Install CLI: `npm install -g supabase` or follow Supabase docs.
  - Authenticate and link your project: `supabase login` and `supabase link --project-ref <your-project-ref>`.
  - Place the migration file under the Supabase migrations folder expected by your workflow, then run `supabase db push` or `supabase migration new` per the CLI docs.

3) Add connection details to your project
  - Add the following env vars to your server environment (use the Service Role key for server-side operations):
    - `SUPABASE_URL` — the project API URL
    - `SUPABASE_SERVICE_ROLE_KEY` — the service role key

4) Integrate in code
  - Use the official Supabase JS client on the server with the service role key, e.g.:

```js
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
```

Testing locally
- Create a `.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (do NOT commit it).
- Install dev deps and run the included quick test:

```bash
npm install
npm run test:supabase
```

5) Notes
  - Consider storing uploaded files in Supabase Storage instead of a `base64` column for large files.
  - The migration creates a `po` schema; adjust search_path or fully-qualify table names if needed.
