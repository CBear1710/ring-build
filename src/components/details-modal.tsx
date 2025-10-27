import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SummaryPanel from "./summary-panel";

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
}

export function DetailsModal({ open, onClose }: DetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent className="sm:max-w-[415px] p-5">
        <DialogHeader>
          <div className="text-center text-xl font-bold tracking-wide">
            SUMMARY
          </div>
        </DialogHeader>
        <SummaryPanel />
      </DialogContent>
    </Dialog>
  );
}
