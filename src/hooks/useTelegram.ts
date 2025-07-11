import { useEffect, useState } from "react";
import type { TelegramWebApp } from "@/types/telegram";
import { COLORS } from "@/constants/colors";

export const useTelegram = () => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);

  useEffect(() => {
    const telegram = window.Telegram?.WebApp;
    if (telegram) {
      telegram.ready();
      telegram.expand();

      telegram.MainButton.setParams({
        text: "Joylash",
        is_active: false,
        color: COLORS.primary, // Telegram Blue
        text_color: COLORS.primaryForeground, // White
      });

      telegram.MainButton.show();
      setTg(telegram);
    }
  }, []);

  const setMainButtonParams = (params: {
    text?: string;
    is_active?: boolean;
    color?: string;
    text_color?: string;
  }) => {
    tg?.MainButton.setParams(params);
  };

  const onMainButtonClick = (callback: () => void) => {
    tg?.MainButton.onClick(callback);
  };

  const closeApp = () => tg?.close();

  return {
    tg,
    closeApp,
    setMainButtonParams,
    onMainButtonClick,
  };
};
