import axios from 'axios';

export interface Review {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string; 
  post_id: string;
  content: string;
  rating: number;
}

export const fetchReviews = async (postId: string): Promise<Review[]> => {
  try {
    const response = await axios.get(`/api/detail/reviews/${postId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`HTTP error! status: ${error.response?.status}`);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};
