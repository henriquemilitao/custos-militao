// components/common/BaseDialog.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type BaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function BaseDialog({
  open,
  onOpenChange,
  title,
  children,
  footer,
}: BaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* largura próxima ao print 1 (estreito) e menos padding vertical */}
      <DialogContent className="w-[360px] max-w-[95%] rounded-2xl shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-left mb-1 text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {/* gap reduzido entre elementos do modal */}
        <div className="space-y-3 py-1">{children}</div>

        {footer && (
          <DialogFooter className="flex flex-row justify-end gap-2 mt-1">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
