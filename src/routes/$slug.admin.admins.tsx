import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, Trash2, ShieldCheck, Send } from "lucide-react";
import { useWedding } from "@/wedding/useWedding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { listAdmins, inviteCoAdmin, removeCoAdmin, type AdminMember } from "@/auth/admins.functions";
import { logAudit } from "@/wedding/audit";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/$slug/admin/admins")({
  component: AdminCoAdmins;
});

// fix: arrow-misuse — corrected below
