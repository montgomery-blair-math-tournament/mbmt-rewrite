import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function StaffNavbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username;
  if (user) {
    username = (
      await supabase.from("user").select("username").eq("id", user.id).single()
    ).data?.username;
  } else {
    username = null;
  }

  const links = [
    { label: "Grading", href: "/staff/grading" },
    { label: "Participants", href: "/staff/participants" },
    { label: "Teams", href: "/staff/teams" },
    { label: "Rounds", href: "/staff/rounds" },
    { label: "Announcements", href: "/staff/announcements" },
    { label: "Admin", href: "/staff/admin" },
  ];

  return (
    <div className="flex gap-1 md:gap-2 w-full p-2 dark:bg-gray-700 bg-gray-300 items-center">
      <Link
        href="/staff"
        className="rounded-md text-center text-lg font-semibold align-center duration-200 hover:bg-gray-400 dark:hover:bg-gray-600 py-1.5 px-3 md:px-4">
        Staff Panel
      </Link>

      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-md text-center align-center duration-200 hover:bg-gray-400 dark:hover:bg-gray-600 py-1.5 px-2 md:px-3 text-sm md:text-base">
          {link.label}
        </Link>
      ))}
      {user && (
        <div className="ml-auto font-medium px-2 flex items-center">
          <span>Hi, {username || "User"}!</span>
          <form action="/staff/auth/signout" method="POST">
            <button
              type="submit"
              className="ml-4 rounded-md text-center align-center duration-200 hover:bg-gray-400 dark:hover:bg-gray-600 py-1.5 px-2 md:px-3 text-sm md:text-base hover:cursor-pointer">
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
