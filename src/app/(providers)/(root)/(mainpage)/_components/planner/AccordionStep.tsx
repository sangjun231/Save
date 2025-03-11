
import React from 'react';


interface AccordionStepProps {
  step: number;
  activeStep: number | null;
  toggleStep: (step: number) => void;
  title: string;
  shortTitle: string;
  selection: string | null;
  children: React.ReactNode;
}

const AccordionStep: React.FC<AccordionStepProps> = ({
  step,
  activeStep,
  toggleStep,
  title,
  shortTitle,
  selection,
  children
}) => {
  return (
    <div className="mt-4">
      {activeStep !== step && (
        <button
          onClick={() => toggleStep(step)}
          className={`h-[50px] w-full px-4 py-2 text-left font-semibold ${activeStep === step ? 'bg-blue-500 text-white' : 'rounded-2xl text-gray-700 shadow-[0_0_30px_#dbdbdb]'} flex items-center justify-between`}
        >
          <span className="text-[13px] font-medium">{shortTitle}</span>
          <span className="text-[13px] font-semibold">{selection || 'Anything'}</span>
        </button>
      )}
      {activeStep === step && (
        <div className="mt-2 rounded-2xl p-5 shadow-[0_0_30px_#dbdbdb]">
          <div className={`${step !== 3 ? 'mb-[15px]' : ''} text-[21px] font-bold text-gray-700`}>{title}</div>
          {children}
        </div>
      )}
    </div>
  );
};

export default AccordionStep;
