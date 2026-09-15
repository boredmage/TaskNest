import TrophyIcon from "@/components/icons/trophy-icon";
import { PulseDots, SuccessOverlay } from "@/components/success-overlay";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect } from "react";

/** How long the dialog stays up before the app moves to the home screen. */
const CELEBRATION_MS = 1600;

/**
 * "Sign in Successful!" dialog (Figma 205:5869). Rendered at the root over
 * the auth screens right after sign-in; the root layout switches to the
 * protected screens once it finishes.
 */
export function SignInSuccess() {
  const finishCelebration = useAuthStore((s) => s.finishCelebration);

  useEffect(() => {
    const timer = setTimeout(finishCelebration, CELEBRATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SuccessOverlay
      icon={<TrophyIcon width={28} height={28} />}
      title="Sign in Successful!"
      body={"Please wait...\nRedirecting you to the homepage."}
      footer={<PulseDots />}
    />
  );
}
