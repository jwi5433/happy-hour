// src/components/map/controls/ChatButton.tsx
'use client';

import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (controlRef.current) return;

    const ChatControl = L.Control.extend({
      options: {
        position: 'bottomright',
      },

      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'chat-button', container);

        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        `;
        button.title = 'Ask AI for recommendations';
        button.href = '#';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.width = '40px';
        button.style.height = '40px';
        button.style.backgroundColor = '#2563eb';
        button.style.color = 'white';
        button.style.borderRadius = '9999px';

        L.DomEvent.on(button, 'click', function (e) {
          L.DomEvent.preventDefault(e);
          L.DomEvent.stopPropagation(e);
          onClick();
        });

        return container;
      },
    });

    controlRef.current = new ChatControl();
    map.addControl(controlRef.current);

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, onClick]);

  return null;
};

export default ChatButton;
