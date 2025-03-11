// 어떤 방식인지???
//export const Posts = Tables<'posts'>;

//postpage
export type PostType = {
  user_id: string;
  title: string;
  content: string;
  image: string;
  maxPeople: number;
  tag: string[];
  price: number;
  selectedPrices: string[];
  startDate: string;
  endDate: string;
};

export type DateType = {
  user_id: string;
  startDate?: string;
  endDate?: string;
};

export type Place = {
  title: string;
  roadAddress: string;
  address?: string;
  latitude: number;
  longitude: number;
  area: string;
  category: string;
  description: string;
};
