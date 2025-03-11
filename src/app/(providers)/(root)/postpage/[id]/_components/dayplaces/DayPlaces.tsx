'use client';

import { Place } from '@/types/types';
import { createClient } from '@/utils/supabase/client';
import { format, startOfDay } from 'date-fns';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { GrLocation } from 'react-icons/gr';
import { IoChevronBack, IoCloseOutline } from 'react-icons/io5';
import AddressSearch from './AddressSearch';
import PostMap from './PostMap';

type PlaceProps = {
  next: () => void;
  prev: () => void;
  goToStep4: () => void;
  selectedDay: string;
  setSelectedDay: React.Dispatch<React.SetStateAction<string>>;
  region: string;
  setRegion: React.Dispatch<React.SetStateAction<string>>;
  sequence: number;
  setSequence: React.Dispatch<React.SetStateAction<number>>;
  postId: string;
  userId: string;
};

const DayPlaces: React.FC<PlaceProps> = ({
  next,
  prev,
  goToStep4,
  selectedDay,
  setSelectedDay,
  region,
  setRegion,
  sequence,
  setSequence,
  postId,
  userId
}) => {
  const [days, setDays] = useState<string[]>([]);
  const startDate = sessionStorage.getItem('startDate');
  const endDate = sessionStorage.getItem('endDate');
  const startDateString = startDate ? new Date(startDate) : null;
  const endDateString = endDate ? new Date(endDate) : null;
  const [placesByDay, setPlacesByDay] = useState<{ [key: string]: Place[] }>({}); // 각 Day에 대한 장소 목록
  const [descriptionsByDay, setDescriptionsByDay] = useState<{ [key: string]: { [index: number]: string } }>({}); // 각 Day에 대한 설명 목록
  const [dayNumbers, setDayNumbers] = useState<{ [key: string]: number[] }>({}); // 각 Day에 대한 번호 목록
  const [step, setStep] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (startDate && endDate) {
      const startDateString = new Date(startDate);
      const endDateString = new Date(endDate);
      const dayArray: string[] = [];

      let currentDate = new Date(startDateString);
      let dayCount = 1;

      while (currentDate <= endDateString) {
        dayArray.push(`Day ${dayCount}`);
        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
      }

      setDays(dayArray);
    }
  }, [startDate, endDate]);

  //sessionStorage 관련
  const storedPlaces = sessionStorage.getItem(selectedDay); //선택한 day에 맞는 value값 가져옴
  const keys = Object.keys(sessionStorage);
  //const storedPlacesKey = keys.find((key) => sessionStorage.getItem(key) === storedPlaces);
  useEffect(() => {
    if (storedPlaces) {
      setPlacesByDay((prev) => ({
        ...prev,
        [selectedDay]: JSON.parse(storedPlaces)
      }));
    }
  }, [selectedDay, step]);

  // 수정할 때, Supabase에서 장소 데이터를 불러오기
  useEffect(() => {
    const storedPlaces = sessionStorage.getItem(selectedDay);

    if (storedPlaces) {
      // 이미 저장된 데이터가 있으면 해당 데이터를 사용
      setPlacesByDay((prev) => ({
        ...prev,
        [selectedDay]: JSON.parse(storedPlaces)
      }));
    } else if (postId && selectedDay) {
      const fetchPlaces = async () => {
        const supabase = createClient();
        const { data: placesData, error } = await supabase
          .from('schedule')
          .select('places, lat, long, area, day')
          .eq('post_id', postId);

        if (error) {
          console.error('Error fetching data:', error);
          return;
        }

        if (placesData && Array.isArray(placesData)) {
          const dayDataForSelectedDay = placesData.find((dayData: any) => dayData.day === selectedDay);
          if (dayDataForSelectedDay && Array.isArray(dayDataForSelectedDay.places)) {
            // 데이터를 변환하여 사용하기 쉬운 형태로
            const combinedPlaces: Place[] = dayDataForSelectedDay.places.map((place: any, index: number) => ({
              title: place.title,
              category: place.category,
              roadAddress: place.roadAddress,
              description: place.description,
              latitude: dayDataForSelectedDay.lat[index],
              longitude: dayDataForSelectedDay.long[index],
              area: dayDataForSelectedDay.area
            }));

            setPlacesByDay((prev) => ({
              ...prev,
              [selectedDay]: combinedPlaces
            }));

            sessionStorage.setItem(selectedDay, JSON.stringify(combinedPlaces));
          }
        } else {
          console.log('No data found for the given postId and day');
        }
      };
      fetchPlaces();
    }
  }, [selectedDay, postId]);

  // description 값을 업데이트하고 sessionStorage에 저장
  const handleDescriptionChange = (index: number, value: string) => {
    setDescriptionsByDay((prevDescriptions) => ({
      ...prevDescriptions,
      [selectedDay]: {
        ...prevDescriptions[selectedDay],
        [index]: value
      }
    }));

    const updatedPlaces = [...(placesByDay[selectedDay] || [])];
    if (updatedPlaces[index]) {
      updatedPlaces[index].description = value;
      setPlacesByDay((prev) => ({
        ...prev,
        [selectedDay]: updatedPlaces
      }));
      sessionStorage.setItem(selectedDay, JSON.stringify(updatedPlaces));
    }
  };

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setDayNumbers((prev) => {
      if (!prev[day]) {
        return {
          ...prev,
          [day]: [1] // 첫 번째 버튼 번호를 1로 초기화
        };
      }
      return prev;
    });
  };

  const addDayNumber = (day: string) => {
    setDayNumbers((prev) => {
      const currentNumbers = prev[day] || [];
      if (currentNumbers.length < 6) {
        const newNumbers = [...currentNumbers, currentNumbers.length + 1];
        return { ...prev, [day]: newNumbers };
      }
      return prev;
    });
  };

  const handleAddSequence = (index: number) => {
    if (window.innerWidth >= 768) {
      setSequence(index);
      setStep(step + 1);
    } else {
      setSequence(index);
      next();
    }
  };

  const dayNumberLength = dayNumbers[selectedDay]?.length;
  useEffect(() => {
    const numbers = dayNumbers[selectedDay] || [];
    const selectedPlaces = placesByDay[selectedDay] || [];

    if (selectedPlaces.length >= numbers.length && numbers.length < 6) {
      addDayNumber(selectedDay);
    }

    const initialDescriptions = selectedPlaces.reduce((acc: { [key: number]: string }, place, index) => {
      acc[index] = place?.description || '';
      return acc;
    }, {});

    setDescriptionsByDay((prev) => ({
      ...prev,
      [selectedDay]: initialDescriptions
    }));
  }, [selectedDay, placesByDay, dayNumberLength]);

  //장소 삭제
  const handleRemovePlace = (index: number) => {
    const updatedPlaces = [...(placesByDay[selectedDay] || [])];
    updatedPlaces[index] = null as any;
    setPlacesByDay((prev) => ({
      ...prev,
      [selectedDay]: updatedPlaces
    }));
    sessionStorage.setItem(selectedDay, JSON.stringify(updatedPlaces));
  };

  const allDaysHavePlaces = useMemo(() => {
    return days.every((day) => {
      const storedPlaces = sessionStorage.getItem(day);
      if (!storedPlaces) {
        return false; // 해당 day에 대한 값이 없으면 false 반환
      }
      try {
        const places = JSON.parse(storedPlaces);
        return Array.isArray(places) && places.length > 0 && places.every((place) => place !== null);
      } catch (e) {
        return false;
      }
    });
  }, [storedPlaces, days]);

  return (
    <div className="flex flex-col justify-center">
      <div className="my-5 flex items-center justify-between web:justify-start">
        <div className="flex w-20 justify-center">
          <div className="icon-button">
            <button onClick={prev} className="flex h-full w-full items-center justify-center">
              <IoChevronBack size={24} />
            </button>
          </div>
        </div>

        <div className="flex w-[199px] flex-col items-center">
          <h1 className="text-lg font-bold web:text-[32px] web:font-semibold">{region}</h1>
          <p className="web:hidden">{`${startDateString ? format(startOfDay(startDateString), 'yy. M. d') : ''} - ${endDateString ? format(startOfDay(endDateString), 'M. d') : ''} `}</p>
        </div>
        <div className="flex w-20"></div>
      </div>

      <div className="web:flex web:w-full web:[height:calc(100vh-200px)]">
        {step === 1 && (
          <div className="m-5 flex flex-col justify-between gap-4">
            {/* 위치 */}
            <div className="flex items-center justify-between web:absolute web:right-5 web:z-10 web:w-[360px] web:rounded-2xl web:bg-white web:p-5">
              <div className="flex">
                <GrLocation className="size-5" />
                <p className="ml-2 font-semibold">{region}</p>
              </div>

              <Link
                href={`/${userId}/profilepage/regionpage`}
                className="cursor-pointer font-semibold text-grayscale-500 underline"
              >
                Change Location
              </Link>
            </div>

            {/* 지도 */}
            <div className="web:hidden">
              <PostMap mapId="map1" selectedPlaces={placesByDay[selectedDay] || []} setRegion={setRegion} />
            </div>

            {/* 장소 선택 구역 */}
            <div className="web:relative web:overflow-auto">
              <p className="mb-5 hidden text-center text-xl font-semibold web:block">{`${startDateString ? format(startOfDay(startDateString), 'yy. M. d') : ''} - ${endDateString ? format(startOfDay(endDateString), 'M. d') : ''} `}</p>

              <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
                {days.map((day, index) => (
                  <button
                    key={index}
                    className={`whitespace-nowrap rounded-full bg-grayscale-50 px-4 py-2 text-sm font-medium ${selectedDay === day ? 'bg-primary-300 text-white' : 'bg-grayscale-50 hover:bg-primary-300 hover:text-white'}`}
                    onClick={() => {
                      setSelectedDay(day);
                      handleDaySelect(day);
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {selectedDay &&
                dayNumbers[selectedDay]?.map((number, index) => (
                  <div key={index} className="flex flex-col">
                    <div className="mb-4 flex">
                      <div className="relative">
                        <p className="z-10 mr-2 size-6 rounded-full border-2 border-grayscale-50 bg-primary-300 text-center text-sm text-white">
                          {number}
                        </p>
                        {index < dayNumbers[selectedDay].length - 1 && (
                          <div className="absolute left-1/3 h-full w-0.5 bg-grayscale-100"></div>
                        )}
                      </div>

                      <div className="w-full rounded-2xl shadow-lg">
                        {placesByDay[selectedDay] && placesByDay[selectedDay][index] ? (
                          <div key={index} className="relative p-4 hover:bg-gray-100">
                            <button className="absolute right-2 top-0 mt-2" onClick={() => handleRemovePlace(index)}>
                              <IoCloseOutline size={24} />
                            </button>
                            <h3
                              className="font-bold"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(placesByDay[selectedDay][index].title)
                              }}
                            />
                            <div className="flex flex-wrap text-xs text-gray-400">
                              <p>{placesByDay[selectedDay][index].category} •&nbsp;</p>
                              <p className="text-xs text-gray-400">{placesByDay[selectedDay][index].roadAddress}</p>
                            </div>

                            <hr className="my-2" />

                            <textarea
                              className="h-full w-full resize-none p-2"
                              placeholder="Introduce your place."
                              value={descriptionsByDay[selectedDay]?.[index] || ''}
                              onChange={(e) => handleDescriptionChange(index, e.target.value)}
                            />
                          </div>
                        ) : (
                          <button
                            className="flex h-[35px] w-full items-center justify-center rounded-lg border-2 border-grayscale-100 p-2 font-medium"
                            onClick={() => handleAddSequence(index)}
                          >
                            Select Place
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="pb-[100px] web:pb-0">
              <div className="absolute bottom-7 left-0 right-0 flex flex-col gap-3 web:static">
                {!allDaysHavePlaces && (
                  <p className="text-center text-sm text-grayscale-400">Please select a place for each date.</p>
                )}
                <button
                  onClick={allDaysHavePlaces ? goToStep4 : undefined}
                  className={`mx-auto h-14 w-[320px] rounded-2xl p-2 text-lg font-semibold text-white ${
                    allDaysHavePlaces ? 'bg-primary-300' : 'bg-primary-100'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <AddressSearch prev={() => setStep(step - 1)} selectedDay={selectedDay} sequence={sequence} />
          </div>
        )}

        <div className="hidden web:block web:h-full web:w-full">
          <PostMap mapId="map2" selectedPlaces={placesByDay[selectedDay] || []} setRegion={setRegion} />
        </div>
      </div>
    </div>
  );
};

export default DayPlaces;
