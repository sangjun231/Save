'use client';

import React, { useEffect } from 'react';
import usePostStore from '@/zustand/postStore';
import { useParams } from 'next/navigation';
import IconRoom from '/public/icons/detail_icons/icon_room_charge.svg';
import IconRestaurant from '/public/icons/detail_icons/icon_restaurant.svg';
import IconTicket from '/public/icons/detail_icons/icon_ticket.svg';
import IconTransportation from '/public/icons/detail_icons/icon_transportation.svg';
import { WebProps } from '@/types/webstate';

export const CheckboxDetail = ({ isWeb }: WebProps) => {
  const { id: postId } = useParams<{ id: string }>();
  const { post, fetchPost } = usePostStore((state) => ({
    post: state.post,
    fetchPost: state.fetchPost
  }));

  useEffect(() => {
    fetchPost(postId);
  }, [postId, fetchPost]);

  if (!post) return <div>Loading...</div>;

  const selectedPrices = post.selectedPrices || [];

  const offers = [
    {
      label: 'Room charge',
      icon: <IconRoom alt="Room charge" width={isWeb ? 44 : 24} height={isWeb ? 44 : 24} />,
      description: 'This tour includes expenses related to accommodation. Accommodation is changeable and adjustable.'
    },
    {
      label: 'Restaurant',
      icon: <IconRestaurant alt="Restaurant" width={isWeb ? 44 : 24} height={isWeb ? 44 : 24} />,
      description: 'Meals and beverages during the tour are included. Dining options can be customized.'
    },
    {
      label: 'Ticket',
      icon: <IconTicket alt="Ticket" width={isWeb ? 44 : 24} height={isWeb ? 44 : 24} />,
      description: 'All entrance fees to museums, parks, and other attractions are covered in this tour.'
    },
    {
      label: 'Transportation',
      icon: <IconTransportation alt="Transportation" width={isWeb ? 44 : 24} height={isWeb ? 44 : 24} />,
      description: 'Transportation to and from the tour sites is included. Options for transport are available.'
    }
  ];

  return (
    <div className="flex w-full flex-col">
      <h2 className="web:text-4xl web:mb-6 mb-4 text-lg font-semibold">What this tour offers</h2>
      <div className="web:grid-cols-4 grid grid-cols-1 gap-4">
        {offers.map(
          (offer) =>
            selectedPrices.includes(offer.label) && (
              <div
                key={offer.label}
                className="web:border web:rounded-2xl web:gap-4 web:p-6 flex flex-col overflow-hidden break-words border-grayscale-100"
              >
                {offer.icon}
                <span className="web:text-xl text-sm font-normal">{offer.label}</span>
                <p className="web:text-base web:block hidden break-words text-sm text-grayscale-500">
                  {offer.description}
                </p>
              </div>
            )
        )}
      </div>
      <hr className="web:my-20 mb-6 mt-8 h-[1px] w-full bg-grayscale-100" />
    </div>
  );
};
