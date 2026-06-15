import { getSessionEmail } from "@/lib/session";
import SignIn from "./SignIn";
import BpApp from "./BpApp";

export default async function Page() {
  const email = await getSessionEmail();
  if (!email) return <SignIn />;
  return <BpApp email={email} name={email.split("@")[0]} />;
}
