import { create } from 'zustand';

interface MyPageState {
  selectedComponent: string | null; // 현재 선택된 컴포넌트의 이름을 저장
  setSelectedComponent: (component: string | null) => void; // selectedComponent 값을 업데이트하는 함수
}

export const useMyPageStore = create<MyPageState>((set) => ({
  selectedComponent: null,
  setSelectedComponent: (component) => set({ selectedComponent: component })
}));
