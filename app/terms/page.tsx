import LegalShell from "../legal/Shell";

export const metadata = {
  title: "Next Novas Terms of Use",
  description: "The rules for using Next Novas apps, including Tolong Alih, in plain words.",
};

export default function Terms() {
  return (
    <LegalShell eyebrow="Next Novas" title="Next Novas Terms of Use">
      <p>
        <em>Last updated 7 October 2026.</em> These are the rules between you and Next Novas, written in
        plain words. The first part applies to every Next Novas app. Each app then has its own short
        section.
      </p>

      <h2>Who we are</h2>
      <p>
        Next Novas is a small, independent maker of consumer apps, run by Weilies Chok in Malaysia.
        Questions: <a href="mailto:weilies.chok@gmail.com">weilies.chok@gmail.com</a>.
      </p>

      <h2>Our promise</h2>
      <ul>
        <li>We never sell your data.</li>
        <li>No advertising networks and no tracking scripts in our apps.</li>
        <li>
          What we keep and why is in our <a href="/privacy">privacy policy</a>.
        </li>
      </ul>

      <h2>Using our apps</h2>
      <ul>
        <li>Give us true information, and keep your sign-in to yourself.</li>
        <li>
          No rude or threatening messages, no spam, and no trying to break an app or to find out about
          other people.
        </li>
        <li>We may close an account that breaks these rules.</li>
        <li>You can ask us to delete your account at any time; see the privacy policy.</li>
      </ul>

      <h2>What we can&apos;t promise</h2>
      <ul>
        <li>
          Our apps are made with care, but they are provided as they are. They can be late, wrong or
          unavailable, and we may change or stop an app.
        </li>
        <li>We are not responsible for disputes between users, or for damage, fines, towing or losses.</li>
        <li>
          If we change these terms, we will update the date at the top and tell you in the app if it
          matters.
        </li>
      </ul>

      <h2>The law</h2>
      <p>These terms follow Malaysian law.</p>

      <h2 id="tolong-alih">Tolong Alih</h2>
      <p>
        <a href="https://alih.nextnovas.com">Tolong Alih</a> helps drivers reach each other when one is
        double-parked and blocking another.
      </p>
      <ul>
        <li>Only add plates of cars you drive. Do not claim someone else&apos;s plate.</li>
        <li>
          Use Declare when you have really blocked someone. Use Trace only when you are really blocked in.
        </li>
        <li>
          Tolong Alih helps drivers reach each other. It cannot make anyone move. Alerts depend on your
          phone, your internet and your settings, so they can be late or not arrive. In an emergency, call
          999.
        </li>
        <li>
          We are not responsible for disputes between drivers, or for damage, fines or towing.
        </li>
      </ul>
      <p>
        Tolong Alih&apos;s own plain-words version is at{" "}
        <a href="https://alih.nextnovas.com/terms.html">alih.nextnovas.com/terms.html</a>.
      </p>
    </LegalShell>
  );
}
