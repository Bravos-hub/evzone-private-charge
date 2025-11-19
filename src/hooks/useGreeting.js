import { useMemo } from 'react';

export function useGreeting(name) {
  return useMemo(() => {
    const h = new Date().getHours();
    const base = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return `${base}${name ? ', ' + name : ''}`;
  }, [name]);
}

