import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const db = createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  // What user.id is
  const userId = user.id;

  // What jobs exist with any employer_id
  const { data: allJobs } = await db.from('jobs').select('id, title, employer_id').limit(20);

  // What jobs match this user
  const { data: myJobs } = await db.from('jobs').select('id, title, employer_id').eq('employer_id', userId).limit(20);

  // What's in employers table
  const { data: employers } = await db.from('employers').select('id').limit(10);

  // Applications count total
  const { count: appCount } = await db.from('applications').select('*', { count: 'exact', head: true });

  return NextResponse.json({
    userId,
    allJobsInDb: allJobs,
    jobsMatchingUserId: myJobs,
    employersTable: employers,
    totalApplicationsInDb: appCount,
  });
}
