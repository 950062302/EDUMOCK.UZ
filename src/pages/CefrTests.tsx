"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import AppFooter from "@/components/AppFooter";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { IeltsTest } from "@/lib/types";
import { getIeltsTests } from "@/lib/local-db";
import { showError } from "@/utils/toast";
import CefrTestCard from "@/components/CefrTestCard";

const CefrTests: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tests, setTests] = useState<IeltsTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTests = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTests = await getIeltsTests();
      setTests(fetchedTests);
    } catch (error: any) {
      showError(`${t("cefr_tests_page.error_loading_tests")} ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const handleSelectTest = (testId: string) => {
    // Bu yerda tanlangan test IDsi bilan mock test sahifasiga yo'naltirish mumkin
    // Hozircha shunchaki konsolga chiqariladi
    console.log("Selected test ID:", testId);
    // navigate(`/mock-test?testId=${testId}`); // Agar mock-test sahifasi test IDsini qabul qilsa
    showError(t("cefr_tests_page.test_selection_not_implemented"));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
        <Card className="w-full max-w-4xl">
          <CardHeader className="pt-8">
            <div className="flex justify-between items-center">
              <Link to="/home">
                <Button variant="default" className="bg-primary hover:bg-primary/90">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("common.back")}
                </Button>
              </Link>
              <CardTitle className="text-xl sm:text-3xl font-bold text-center flex-grow flex items-center justify-center gap-2">
                <BookOpen className="h-7 w-7 text-primary" />
                {t("home_page.cefr_tests")}
              </CardTitle>
              <div className="w-[80px] h-4"></div>
            </div>
            <CardDescription className="text-center mt-2">{t("cefr_tests_page.select_test_description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <p className="text-center">{t("common.loading")}</p>
            ) : tests.length === 0 ? (
              <p className="text-muted-foreground text-center">{t("cefr_tests_page.no_tests_available")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test) => (
                  <CefrTestCard key={test.id} test={test} onSelectTest={handleSelectTest} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
};

export default CefrTests;