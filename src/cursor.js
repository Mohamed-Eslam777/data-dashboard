const initCustomCursor = () => {
  const initialize = () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorFollower = document.querySelector('.cursor-follower');

    if (cursorDot && cursorFollower) {
      window.addEventListener('mousemove', e => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        cursorFollower.style.left = e.clientX + 'px';
        cursorFollower.style.top = e.clientY + 'px';
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // DOM is already ready, use setTimeout to ensure React has rendered
    setTimeout(initialize, 0);
  }
};

export default initCustomCursor;

