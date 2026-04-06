"use client";

import React from "react";
import {
  Mail,
  Calendar,
  Trash2,
  Clock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleBadge, UserAvatar } from "./MemberUI";
import { MemberTableProps } from "@/types";

export function MemberTable({
  members,
  currentUserId,
  canDelete,
  onDeleteItem,
}: MemberTableProps) {
  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-800 text-base font-bold flex items-center">
            <ShieldCheck className="mr-2 h-4 w-4 text-blue-600" />
            Organization Members
          </CardTitle>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white border border-slate-200 px-2.5 py-1 rounded-full">
            {members.length} Total
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  User
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Member Since
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        name={member.name}
                        email={member.email}
                        className={
                          member.status === "pending" ? "bg-slate-400/50" : ""
                        }
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {member.name ||
                              (member.status === "pending"
                                ? "Invitation Sent"
                                : "Pending Account")}
                          </p>
                          {member.userId === currentUserId && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                          {member.status === "pending" && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              PENDING
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {format(new Date(member.joinedAt), "MMM d, yyyy")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canDelete && member.userId !== currentUserId && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          onDeleteItem(member.id, member.status === "pending")
                        }
                        title={
                          member.status === "pending"
                            ? "Revoke Invitation"
                            : "Remove Member"
                        }
                        className={`h-8 w-8 transition-all opacity-0 group-hover:opacity-100 ${
                          member.status === "pending"
                            ? "text-slate-300 hover:text-amber-600 hover:bg-amber-50"
                            : "text-slate-300 hover:text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {member.status === "pending" ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
