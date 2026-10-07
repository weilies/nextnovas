import LegalShell from "../legal/Shell";

export const metadata = {
  title: "Next Novas Privacy Policy",
  description:
    "How Next Novas and its apps, including Tolong Alih, handle your information, in plain words.",
};

export default function Privacy() {
  return (
    <LegalShell eyebrow="Next Novas" title="Next Novas Privacy Policy">
      <p>
        <em>Last updated 7 October 2026.</em> This policy covers every app made by Next Novas. The first
        part applies to all of them. Each app then has its own short section with the details that are
        specific to it.
      </p>

      <h2>Who we are</h2>
      <p>
        Next Novas is a small, independent maker of consumer apps, run by Weilies Chok in Malaysia. We
        handle personal data under Malaysia&apos;s Personal Data Protection Act 2010. For anything about
        your data, email{" "}
        <a href="mailto:weilies.chok@gmail.com">weilies.chok@gmail.com</a>. A real person reads it.
      </p>

      <h2>Information we get from Google</h2>
      <p>
        If you choose to sign in with Google, Google tells us your <strong>name</strong>,{" "}
        <strong>email address</strong> and <strong>profile picture</strong>. We use them only to create
        and run your account in the app you signed in to: to recognise you when you return, to show your
        name and picture to you, and to contact you about your account if we must. We do not sell this
        information, share it for advertising, or use it for anything else. Next Novas&apos;s use of
        information received from Google APIs follows the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including its Limited Use requirements. We ask Google for nothing beyond your basic profile and
        email.
      </p>

      <h2>What we never do</h2>
      <ul>
        <li>We never sell your data.</li>
        <li>We use no advertising networks and no tracking or analytics scripts in our apps.</li>
        <li>We do not use your information to target you with ads.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We share your information only with the services that run our apps for us, and only so they can do
        that job: <strong>Cloudflare</strong> (hosting), <strong>Neon</strong> (database and sign-in,
        servers in Singapore), <strong>Vercel</strong> (this website) and <strong>Google</strong> (if you
        choose Google sign-in). We also share information if the law requires it. Each app&apos;s section
        below lists anything else that app shares.
      </p>

      <h2>Storage and security</h2>
      <p>
        Your data is stored in a managed database in Singapore, behind sign-in, and each account can read
        only its own records. Connections are encrypted. Passwords are never stored in readable form. No
        system is perfectly safe; if something goes wrong with your information, we will tell you.
      </p>

      <h2>How long we keep it, and how to delete it</h2>
      <p>
        We keep your account and its records for as long as you have an account. To delete them, email{" "}
        <a href="mailto:weilies.chok@gmail.com">weilies.chok@gmail.com</a> from the address on the
        account. We will delete your account and its records within <strong>30 days</strong>. Short-lived
        technical backups of the database age out within days after that. You can also ask us to show you
        or correct what we hold about you, using the same email.
      </p>

      <h2>Cookies and storage on your device</h2>
      <p>
        Our apps use a sign-in cookie to keep you signed in, and your browser&apos;s storage to remember
        small settings such as your language. We use no advertising or analytics cookies.
      </p>

      <h2>Children</h2>
      <p>Our apps are not meant for children under 13, and we do not knowingly collect their information.</p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we will update the date at the top. If the change matters, we will also
        tell you in the app.
      </p>

      <h2 id="tolong-alih">Tolong Alih</h2>
      <p>
        <a href="https://alih.nextnovas.com">Tolong Alih</a> helps a driver who has been boxed in by a
        double-parked car reach the driver who blocked them. In addition to the above, it keeps:
      </p>
      <ul>
        <li>
          <strong>Your car plates</strong>, which you add yourself, so that the right driver gets the
          alert.
        </li>
        <li>
          <strong>Blocks and messages:</strong> the blocks you declare or are caught in, and the short
          messages in them, so the two drivers can sort it out.
        </li>
        <li>
          <strong>Location:</strong> your position when you declare a block, with the road, area, city and
          state of the place, and your approximate position to show the place name at the top of the app.
          Other drivers never see it. To show the place name,
          the app sends your approximate position to OpenStreetMap.
        </li>
        <li>
          <strong>The state you open the app from:</strong> once a day, when you open the app signed in,
          we note which state you are in (for example Selangor), never your exact position. We use it to
          count how many drivers use the app each day and, as totals only, to show local shops roughly
          where drivers are.
        </li>
        <li>
          <strong>Your phone&apos;s alert address:</strong> a code your browser gives us so we can send
          you alerts. It is not your phone number. We do not ask for your phone number.
        </li>
        <li>
          <strong>Counts and limits:</strong> that you used the Trace feature (so nobody can try thousands
          of plates), and that an ad was shown to your account (so it is counted once). Shops that
          advertise see only totals, never who.
        </li>
      </ul>
      <p>
        We may share <strong>totals</strong> with local councils and other public bodies to help plan
        parking, for example how many blocks happened on a road and how long they lasted. We never share
        plates, names, emails or accounts. When you create an account you tick a box to agree to our terms
        and this policy, and we keep a record of which version you agreed to.
      </p>
      <p>
        The other driver sees your car plate and a short message such as &quot;back in 15 min&quot;. They
        do not see your name or email. Tolong Alih&apos;s own plain-words notes are at{" "}
        <a href="https://alih.nextnovas.com/privacy.html">alih.nextnovas.com/privacy.html</a>.
      </p>
    </LegalShell>
  );
}
