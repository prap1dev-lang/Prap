import { redirect } from "next/navigation";

// The dashboard no longer has its own project listing — browsing happens on the
// main website's property section. Redirect any old links there.
export default function Page() {
  redirect("/projects");
}
