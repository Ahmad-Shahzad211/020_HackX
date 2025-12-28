import React from 'react';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  onClick: () => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--color-input-bg)',
        color: 'var(--color-text)',
        borderRadius: '0.5rem',
        fontWeight: 500,
        transition: 'opacity 0.2s',
        width: '100%',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        border: '1px solid var(--color-border)',
      }}
      onMouseOver={e => (e.currentTarget.style.opacity = '0.8')}
      onMouseOut={e => (e.currentTarget.style.opacity = '1')}
      aria-label="Search chats"
    >
      <Search size={18} style={{ color: 'var(--color-primary)' }} />
      <span>Search Chats</span>
    </button>
  );
};

export default SearchButton;
