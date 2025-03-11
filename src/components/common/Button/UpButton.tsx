'use client';
import { useEffect, useState } from 'react';
import { IoIosArrowRoundUp } from 'react-icons/io';

function UpButton() {
  const [toggleButton, setToggleButton] = useState(false);

  const handleScroll = () => {
    if (typeof window !== 'undefined') {
      const { scrollY } = window;
      scrollY > 200 ? setToggleButton(true) : setToggleButton(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const goToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return toggleButton ? (
    <button
      onClick={goToTop}
      className="fixed bottom-24 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-black bg-white"
    >
      <IoIosArrowRoundUp className="size-8" />
    </button>
  ) : null;
}

export default UpButton;
