import { useState, useRef, useEffect } from "react";

export const useMonologue = (texts, onFinish = () => {}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const bottomRef = useRef(null);

  const handleClick = () => {
    if (currentIndex < texts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentIndex === texts.length - 1) {
      setShowButton(true);
      onFinish();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentIndex, showButton]);

  return {
    currentIndex,
    showButton,
    handleClick,
    bottomRef,
  };
};
