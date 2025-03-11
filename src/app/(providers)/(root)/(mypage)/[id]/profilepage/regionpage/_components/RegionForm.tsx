'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { API_MYPAGE_PROFILE } from '@/utils/apiConstants';
import { translateAddress } from '@/utils/post/postData';

const RegionForm = () => {
  const MySwal = withReactContent(Swal);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [translatedRegion, setTranslatedRegion] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const userId = pathname.split('/')[1];

  const loadNaverMapScript = () => {
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NCP_CLIENT_ID}&submodules=geocoder`;
    script.async = true;

    script.onload = () => {
      if (window.naver && window.naver.maps) {
        setIsScriptLoaded(true);
      } else {
        toast.error('네이버 맵 스크립트 로드 실패');
      }
    };

    script.onerror = () => {
      toast.error('네이버 맵 스크립트 로드 실패');
    };

    document.body.appendChild(script);
  };

  const getCurrentPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ latitude, longitude });
        },
        (error) => {
          toast.error(`Error occurred while retrieving location: ${error.message}`);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const getRegionName = (latitude: number, longitude: number) => {
    if (!window.naver) return;

    const coord = new window.naver.maps.LatLng(latitude, longitude);

    window.naver.maps.Service.reverseGeocode(
      {
        location: coord,
        coordType: window.naver.maps.Service.CoordType.LatLng
      },
      (status: any, response: any) => {
        if (status === 200) {
          if (response.result.items && response.result.items.length > 0) {
            const address = response.result.items[0].address;
            setRegion(address);
          } else {
            toast.error('주소를 찾을 수 없습니다.');
          }
        } else {
          toast.error('Failed to get the location name.');
        }
      }
    );
  };

  const initializeMap = () => {
    if (position) {
      const map = new window.naver.maps.Map('map', {
        center: new window.naver.maps.LatLng(position.latitude, position.longitude),
        zoom: 15
      });

      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(position.latitude, position.longitude),
        map: map
      });

      getRegionName(position.latitude, position.longitude);
    }
  };

  const handleSave = async () => {
    const result = await MySwal.fire({
      title: 'Location updated successfully',
      icon: 'success',
      customClass: {
        actions: 'flex flex-col gap-[8px] w-full',
        title: 'font-semibold text-[18px]',
        popup: 'rounded-[16px] p-[24px]',
        confirmButton: 'bg-primary-300 text-white w-full text-[16px] p-[12px] rounded-[12px]'
      }
    });

    try {
      if (region && userId && result.isConfirmed) {
        await axios.put(API_MYPAGE_PROFILE(userId), {
          region: translatedRegion || region
        });
        router.replace(`/${userId}/profilepage`);
      }
    } catch (error) {
      MySwal.fire('Failed!', 'Failed to set location.', 'error');
    }
  };

  const handleBack = () => {
    router.replace(`/${userId}/profilepage`);
  };

  useEffect(() => {
    loadNaverMapScript();
  }, []);

  useEffect(() => {
    if (isScriptLoaded) {
      getCurrentPosition();
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    if (position) {
      initializeMap();
    }
  }, [position]);

  useEffect(() => {
    const translateRegionName = async () => {
      if (region) {
        try {
          const translatedAddress = await translateAddress(region);
          const addressParts = translatedAddress.split(' ');
          const lastPart = addressParts[addressParts.length - 1];
          const secondLastPart = addressParts[addressParts.length - 2];
          const combinedAddress = `${secondLastPart} ${lastPart}`;
          setTranslatedRegion(`${lastPart}, Korea`);
        } catch (error) {
          toast.error('Failed to translate the region.');
        }
      }
    };

    translateRegionName();
  }, [region]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-grayscale-50 web:h-[44px] web:w-[44px]"
          onClick={handleBack}
        >
          <Image
            className="web:h-[33px] web:w-[33px]"
            src="/icons/tabler-icon-chevron-left.svg"
            alt="Go Back"
            width={24}
            height={24}
          />
        </button>
        <p className="mx-auto text-[18px] font-semibold text-primary-900 web:ml-[20px] web:self-start web:text-[32px]">
          Location
        </p>
        <button className="text-[14px] font-medium text-action-color web:text-[24px]" onClick={handleSave}>
          Done
        </button>
      </div>
      <div className="mb-[30px] web:mx-auto web:max-w-[642px]">
        <div
          className="my-[20px] h-[400px] w-full rounded-[16px] web:my-[40px] web:min-h-[calc(100vh-600px)]"
          id="map"
        ></div>
        <div>
          <p className="mb-[8px] text-[16px] font-medium web:text-[21px]">Location</p>
          {region ? (
            <p className="flex items-center justify-between rounded-2xl border bg-grayscale-50 p-[16px] text-[16px] text-grayscale-900">
              {translatedRegion || 'Loading...'}
              <span>
                <Image src="/icons/tabler-icon-location-filled.svg" alt="location" width={32} height={32} />
              </span>
            </p>
          ) : (
            <p className="flex items-center justify-between rounded-2xl border bg-grayscale-50 p-[16px] text-[16px] text-grayscale-400">
              Set your location
              <span>
                <Image src="/icons/tabler-icon-location-filled.svg" alt="location" width={32} height={32} />
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionForm;
