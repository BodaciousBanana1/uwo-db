document.addEventListener('DOMContentLoaded', function() {
  // Comment tab switching
  const tabs = document.querySelectorAll('.comment-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetId = this.dataset.tab + '-panel';

      // Update tabs
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Update panels
      document.querySelectorAll('.comment-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });
});
