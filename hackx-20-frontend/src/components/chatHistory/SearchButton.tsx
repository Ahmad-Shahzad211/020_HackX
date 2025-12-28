import React from 'react';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className='bg-gray-400'
      style={{
        color: 'white',
        borderRadius: '0.5rem',
        fontWeight: 500,
        transition: 'background 0.2s, color 0.2s',
        width: '100%',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'var(--color-btn-hover-bg)')}
      onMouseOut={e => (e.currentTarget.style.background = 'var(--color-btn-bg)')}
      aria-label="Search chats"
    >
      <Search size={18} style={{ color: 'var(--color-btn-icon)' }} />
      <span>Search Chats</span>
    </button>
  );
};

export default SearchButton;
