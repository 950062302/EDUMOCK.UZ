"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { TestPhase } from "@/hooks/use-mock-test-logic";

interface TestControlsProps {
  isTestStarted: boolean;
  currentPhase: TestPhase;
  handleStartTestClick: () => void;
  handleEndTest: () => void;
  handleResetTest: () => void;
}

const TestControls: React.FC<TestControlsProps> = ({
  isTestStarted,
  currentPhase,
  handleStartTestClick,
  handleEndTest,
  handleResetTest,
}) => {
  return (
    <div className="space-y-6">
      {!isTestStarted && currentPhase === "idle" && (
        <Button onClick={handleStartTestClick} size="lg" className="text-lg px-8 py-4">
          Testni boshlash (yozib olish bilan)
        </Button>
      )}

      {isTestStarted && currentPhase !== "finished" && (
        <div className="flex gap-2 mt-4">
          {/* The "Keyingi savol (Avtomatik)" button is now disabled as transitions are automatic */}
          <Button className="flex-grow" disabled={true}>
            Keyingi savol (Avtomatik)
          </Button>
          <Button onClick={handleEndTest} variant="destructive" className="flex-grow">
            Testni tugatish
          </Button>
        </div>
      )}

      {currentPhase === "finished" && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">Test yakunlandi! 🎉</h3>
          <p className="text-muted-foreground">Siz barcha mavjud savollarni ko'rib chiqdingiz.</p>
          <Button onClick={handleResetTest} variant="outline" className="w-full">
            Testni qayta boshlash
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Oxirgi yozib olingan sessiyangiz "Records" bo'limida mavjud.
          </p>
        </div>
      )}
    </div>
  );
};

export default TestControls;