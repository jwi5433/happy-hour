'use client';

import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import L from 'leaflet';

const ChatButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (controlRef.current) return;

    const ChatControl = L.Control.extend({
      options: {
        position: 'bottomright',
      },

      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-control chat-icon-container');
        container.style.margin = '0 15px 20px 0';
        container.style.cursor = 'pointer';
        container.style.filter = 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))';
        container.style.transition = 'transform 0.3s ease, filter 0.3s ease';
        container.style.backgroundColor = 'transparent';
        container.style.backdropFilter = 'none';
        container.style.borderRadius = '16px';
        container.style.padding = '0';
        
        container.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="85" height="85">
            <!-- Animated Circle around chat bubble -->
            <circle cx="40" cy="40" r="38" fill="none" stroke="#5D5FEF" stroke-width="2">
              <animate attributeName="r" values="36;38;36" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-width" values="2;3;2" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
            </circle>
            
            <!-- Pulsing Effect -->
            <circle cx="40" cy="40" r="32" fill="none" stroke="#5D5FEF" stroke-width="1" opacity="0.3">
              <animate attributeName="r" values="32;40;32" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="4s" repeatCount="indefinite" />
            </circle>
            
            <!-- Chat Bubble - dark themed -->
            <rect x="20" y="20" width="40" height="30" rx="8" ry="8" fill="#374151" stroke="#5D5FEF" stroke-width="1.5">
              <animate attributeName="transform" attributeType="XML" type="scale" from="0.97" to="1" begin="0s" dur="1.5s" repeatCount="indefinite" additive="sum"/>
              <animate attributeName="transform" attributeType="XML" type="scale" from="1" to="0.97" begin="1.5s" dur="1.5s" repeatCount="indefinite" additive="sum"/>
            </rect>
            <polygon points="30,50 30,58 38,50" fill="#374151" stroke="#5D5FEF" stroke-width="1.5" />
            
            <!-- Typing Animation Dots -->
            <circle cx="30" cy="35" r="3.5" fill="#3B82F6">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="40" cy="35" r="3.5" fill="#3B82F6">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="35" r="3.5" fill="#3B82F6">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        `;

        container.onmouseover = function() {
          container.style.transform = 'scale(1.15)';
          container.style.filter = 'drop-shadow(0 8px 16px rgba(93, 95, 239, 0.5))';
        };
        
        container.onmouseout = function() {
          container.style.transform = 'scale(1)';
          container.style.filter = 'drop-shadow(0 4px 8px rgba(93, 95, 239, 0.3))';
        };

        L.DomEvent.on(container, 'click', function (e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);
          
          container.style.transform = 'scale(0.9)';
          
          setTimeout(() => {
            container.style.transform = 'scale(1)';
          }, 150);
          
          onClick();
        });

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

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
