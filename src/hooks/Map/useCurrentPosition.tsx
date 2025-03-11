import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export const useCurrentPosition = () => {
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
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
  }, []);

  return position;
};
