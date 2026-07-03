"use client";

import React, { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const TEMPLATE_CATEGORY_OPTIONS = [
  "自定义模板",
  "通用模板",
  "报告模板",
  "电厂专区",
] as const;

interface SaveLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    layoutName: string,
    description: string,
    template_info_id: string,
    category: string
  ) => Promise<string | null>;
  isSaving: boolean;
  template_info_id: string;
}

export const SaveLayoutModal: React.FC<SaveLayoutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  template_info_id,
}) => {
  const [layoutName, setLayoutName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("自定义模板");

  const handleSave = async () => {
    if (!layoutName.trim()) return;
    await onSave(layoutName.trim(), description.trim(), template_info_id, category);
  };

  const handleClose = () => {
    if (isSaving) return;
    setLayoutName("");
    setDescription("");
    setCategory("自定义模板");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]" style={{ zIndex: 1000 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              保存模板
            </span>
          </DialogTitle>
          <DialogDescription>
            为模板设置名称、说明和类别，保存后会按类别展示在模板库中。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="layout-name" className="text-sm font-medium">
              模板名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="layout-name"
              value={layoutName}
              onChange={(event) => setLayoutName(event.target.value)}
              placeholder="例如：电厂月度汇报模板"
              disabled={isSaving}
              className="w-full"
              aria-required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">
              模板说明 <span className="text-gray-400">（可选）</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="简要说明这个模板适合哪些场景……"
              disabled={isSaving}
              className="w-full resize-none"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="template-category" className="text-sm font-medium">
              模板类别
            </Label>
            <Select value={category} onValueChange={setCategory} disabled={isSaving}>
              <SelectTrigger id="template-category" className="w-full">
                <SelectValue placeholder="选择模板类别" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>正在保存模板，请稍候……</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !layoutName.trim()}
            className="bg-green-600 hover:bg-green-700"
            aria-busy={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在保存……
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存模板
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
