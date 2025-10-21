import CopyLink from "@/icons/copy-link";
import Facebook from "@/icons/facebook";

export function ShareActions() {
  // TODO: Handle share fb and copy link

  return (
    <div className="flex gap-5 md:gap-2">
      <CopyLink />

      <Facebook />
    </div>
  );
}
