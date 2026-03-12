import { ref, onMounted, onUnmounted } from 'vue';

export function useClickOutside(targetRef, callback) {
  const handleClickOutside = (event) => {
    if (targetRef.value && !targetRef.value.contains(event.target)) {
      callback();
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });

  return {
    targetRef,
  };
}
