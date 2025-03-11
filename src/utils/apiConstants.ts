export const API_MYPAGE_PROFILE = (userId: string) => `/api/mypage/${userId}/profile`;
export const API_MYPAGE_PROFILE_PASSWORD = (userId: string) => `/api/mypage/${userId}/profile/password`;
export const API_MYPAGE_LIKES = (userId: string) => `/api/mypage/${userId}/profile/postlikes`;
export const API_MYPAGE_POST = (userId: string) => `/api/mypage/${userId}/profile/post`;
export const API_MYPAGE_RESERVATION = (userId: string) => `/api/mypage/${userId}/profile/reservation`;
export const API_MYPAGE_REVIEWS = (userId: string) => `/api/mypage/${userId}/reviews`;
export const API_MYPAGE_CHATS = (userId: string) => `/api/mypage/${userId}/chats`;
export const API_MYPAGE_PAYMENTS = (userId: string) => `/api/mypage/${userId}/payments`;
export const API_MYPAGE_TOURRESERVATIONLIST = (userId: string, postId: string) =>
  `/api/mypage/${userId}/tourreservationlist?postId=${postId}`;

export const API_POST_DETAILS = (postId: string) => `/api/mypage/${postId}/chatpost`;

export const API_POST = () => `/api/post`;
