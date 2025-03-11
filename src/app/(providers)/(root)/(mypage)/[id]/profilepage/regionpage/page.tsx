import RegionForm from './_components/RegionForm';

export interface CalendarProps {
  next: () => void;
}

function RegionPage() {
  return (
    <div className="mx-[20px] mt-[8px] web:mt-[40px] web:mx-[88px]">
      <RegionForm />
    </div>
  );
}
export default RegionPage;
