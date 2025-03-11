import Image from 'next/image';
import { useRouter } from 'next/navigation';

const locations = [
  { name: 'Busan', src: '/img/Busan.jpeg', webpSrc: '/img/Busan.webp' },
  { name: 'Seoul', src: '/img/Seoul.jpeg', webpSrc: '/img/Seoul.webp' },
  { name: 'Chuncheon', src: '/img/Chuncheon.jpeg', webpSrc: '/img/Chuncheon.webp' },
  { name: 'Jeju', src: '/img/Jeju.jpeg', webpSrc: '/img/Jeju.webp' },
  { name: 'Yeosu', src: '/img/Yeosu.jpeg', webpSrc: '/img/Yeosu.webp' },
  { name: 'Jeonju', src: '/img/Jeonju.jpeg', webpSrc: '/img/Jeonju.webp' }
];

export default function CircleImageList() {
  const router = useRouter();

  const handleClick = (locationName: string) => {
    const query = new URLSearchParams();
    query.set('city', locationName);
    router.push(`/results?${query.toString()}`);
  };

  return (
    <div className="mb-10 mt-6 flex flex-wrap justify-center gap-4 md:my-[80px] md:justify-center md:gap-10">
      {locations.map((location) => (
        <div
          key={location.name}
          className={`flex cursor-pointer flex-col items-center ${location.name === 'Yeosu' || location.name === 'Jeonju' ? 'hidden md:flex' : ''}`}
          onClick={() => handleClick(location.name)}
        >
          <picture>
            <source srcSet={location.webpSrc} type="image/webp" />
            <Image
              src={location.src}
              alt={location.name}
              width={120} // 데스크탑에서 이미지 크기
              height={120} // 데스크탑에서 이미지 크기
              className="h-16 w-16 rounded-full border-gray-300 md:h-24 md:w-24"
            />
          </picture>
          <span className="mt-2 text-center text-xs md:mt-6 md:text-lg">{location.name}</span>
        </div>
      ))}
    </div>
  );
}
