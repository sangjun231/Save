'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import Image from 'next/image';
import AccordionStep from './AccordionStep';
import TagSelector from './TagSelector';
import CitySelector from './CitySelector';
import PeriodSelector from './PeriodSelector';

const tags = [
  'Activities',
  'Nature',
  'Famous',
  'Tourist Attraction',
  'Shopping',
  'Peaceful',
  'Mukbang',
  'Cultural/Arts',
  'K-Drama Location'
];
const cities = ['Seoul', 'Busan', 'Sokcho', 'Gangneung', 'Jeonju', 'Daegu', 'Gyeongju', 'Yeosu', 'Jeju'];

interface TravelPlannerProps {
  isModal?: boolean;
}

export default function TravelPlanner({ isModal = false }: TravelPlannerProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<number | null>(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prevTags) => (prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]));
  };

  const handleCityClick = (city: string) => {
    setSelectedCity(city);
  };

  const formatDateToShortString = (date: Date | null): string => {
    return date
      ? `${date.getFullYear().toString().slice(-2)}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
      : 'Anything';
  };

  const handleDateSelection = () => {
    const query = new URLSearchParams();

    if (selectedTags.length > 0) {
      query.append('tags', JSON.stringify(selectedTags));
    }

    if (selectedCity) {
      query.append('city', selectedCity);
    }

    if (startDate) {
      query.append('startDate', startDate.toISOString());
    }

    if (endDate) {
      query.append('endDate', endDate.toISOString());
    }

    // router.push(`/results?${query.toString()}`);
    window.location.href = `/results?${query.toString()}`;
  };

  const toggleStep = (step: number) => {
    setActiveStep(activeStep === step ? null : step);
  };

  const goToNextStep = () => {
    if (activeStep !== null) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <div className="p-4 pb-16">
      {!isModal && (
        <div className="mb-[38px] block grid grid-cols-[1fr_auto_1fr] items-center md:hidden">
          <button className="mr-auto rounded-full bg-gray-100 p-1" onClick={() => router.back()}>
            <Image src="/icons/tabler-icon-x.svg" alt="Close" width={24} height={24} />
          </button>
          <div className="col-start-2 text-lg font-semibold">Search</div>
        </div>
      )}

      <div className="mt-4">
        <AccordionStep
          step={1}
          activeStep={activeStep}
          toggleStep={toggleStep}
          title="What is your travel style?"
          shortTitle="Travel style"
          selection={selectedTags.length > 0 ? `${selectedTags[0]} + ${selectedTags.length - 1}` : 'Anything'}
        >
          <TagSelector
            selectedTags={selectedTags}
            handleTagClick={handleTagClick}
            tags={tags}
            goToNextStep={goToNextStep}
          />
        </AccordionStep>

        <AccordionStep
          step={2}
          activeStep={activeStep}
          toggleStep={toggleStep}
          title="Where to?"
          shortTitle="Where"
          selection={selectedCity || 'Anywhere'}
        >
          <CitySelector
            selectedCity={selectedCity}
            handleCityClick={handleCityClick}
            cities={cities}
            goToPreviousStep={() => toggleStep(1)}
            goToNextStep={goToNextStep}
          />
        </AccordionStep>

        <AccordionStep
          step={3}
          activeStep={activeStep}
          toggleStep={toggleStep}
          title="When’s your tour?"
          shortTitle="When"
          selection={
            startDate && endDate
              ? `${formatDateToShortString(startDate)}~${formatDateToShortString(endDate)}`
              : 'Any Week'
          }
        >
          <PeriodSelector
            next={handleDateSelection}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            isModal={isModal}
          />
        </AccordionStep>
      </div>
    </div>
  );
}
