"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Button as Button2 } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface PersonilazedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export function PersonilazedDialog({ open, onOpenChange, title = "Faça login para continuar", description = "Você precisa estar logado para adicionar produtos ao carrinho ou finalizar sua compra.", buttonText = "Ok" }: PersonilazedDialogProps) {
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center">
        <DialogTitle className="mt-4 text-2xl">{title}</DialogTitle>
        <DialogDescription className="font-medium">
          {description}
        </DialogDescription>
        <DialogFooter>
          <Button
            className="rounded-full"
            // size="lg"
            onClick={() => {
              // if (window.location.pathname === "/") {
              //   window.location.reload(); // ou só fecha o dialog
              // } else {
              //   router.push("/");
              // }
              onOpenChange(false);
            }}
          >
            {buttonText}
          </Button>
          {/* <Button2
            className="rounded-full"
            variant="outline"
            size="lg"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button2> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}