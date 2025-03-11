import React from 'react';

interface TagSelectorProps {
  selectedTags: string[];
  handleTagClick: (tag: string) => void;
  tags: string[];
  goToNextStep: () => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, handleTagClick, tags, goToNextStep }) => {
  return (
    <div>
      <div className="mt-2 rounded-md">
        <div className="flex flex-wrap">
          {tags.map((tag) => (
            <div
              key={tag}
              className={`mb-2 mr-1 flex min-w-[30%] cursor-pointer justify-center rounded-3xl border px-3 py-2 text-center text-[13px] font-medium ${
                selectedTags.includes(tag) ? 'bg-[#B95FAB] text-white' : 'bg-gray-100'
              }`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagSelector;
