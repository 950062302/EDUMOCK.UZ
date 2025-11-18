"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { showError } from "@/utils/toast";
import { useTranslation } from 'react-i18next'; // useTranslation import qilish

interface StudentInfoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentId: string, studentName: string, studentPhone: string) => void;
}

const StudentInfoForm: React.FC<StudentInfoFormProps> = ({ isOpen, onClose, onSave }) => {
  console.log("StudentInfoForm: Component rendered. isOpen:", isOpen);
  const [studentId, setStudentId] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [studentPhone, setStudentPhone] = useState<string>("");
  const { t } = useTranslation(); // useTranslation hookini ishlatish

  const handleSubmit = () => {
    if (!studentId.trim() || !studentName.trim() || !studentPhone.trim()) {
      showError(t("add_question_page.error_fill_all_fields")); // Tarjima qilingan xabar
      return;
    }
    onSave(studentId.trim(), studentName.trim(), studentPhone.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-[50%] top-[50%] z-[9999] w-full max-w-[425px] translate-x-[-50%] translate-y-[-50%] bg-background p-6 shadow-lg sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>{t("mock_test_page.student_info_title")}</DialogTitle> {/* Tarjima qilingan matn */}
          <DialogDescription>
            {t("mock_test_page.student_info_description")} {/* Tarjima qilingan matn */}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="studentId" className="text-right">
              {t("mock_test_page.student_id")} {/* Tarjima qilingan matn */}
            </Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="col-span-3"
              placeholder={t("mock_test_page.student_id_placeholder")} {/* Tarjima qilingan matn */}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="studentName" className="text-right">
              {t("mock_test_page.student_name")} {/* Tarjima qilingan matn */}
            </Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="col-span-3"
              placeholder={t("mock_test_page.student_name_placeholder")} {/* Tarjima qilingan matn */}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="studentPhone" className="text-right">
              {t("mock_test_page.student_phone")} {/* Tarjima qilingan matn */}
            </Label>
            <Input
              id="studentPhone"
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              className="col-span-3"
              placeholder={t("mock_test_page.student_phone_placeholder")} {/* Tarjima qilingan matn */}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            {t("mock_test_page.start_test")} {/* Tarjima qilingan matn */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentInfoForm;