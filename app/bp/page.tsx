import { auth } from "@/auth";
import SignIn from "./SignIn";
import BpApp from "./BpApp";

export default async function Page() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return <SignIn />;
  return (
    <BpApp
      email={email}
      name={session.user?.name || email}
      image={session.user?.image || ""}
    />
  );
}
