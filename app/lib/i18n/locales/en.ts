const en = {
  sidebar: {
    menu: {
      newChat: 'New Chat',
      searchPlaceholder: 'Search chats...',
      searchAriaLabel: 'Search chats',
      myChats: 'My Chats',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      deleteSelected: 'Delete Selected',
      noHistory: 'No chat history',
      noResults: 'No matches found',
      enterSelectionMode: 'Enter selection mode',
      exitSelectionMode: 'Exit selection mode',
      guestUser: 'Guest',
      user: 'User',
      // Toast
      deleteSuccess: 'Chat deleted successfully',
      deleteFail: 'Failed to delete chat',
      bulkDeleteSuccess: 'Successfully deleted {{count}} chats',
      bulkDeletePartial: 'Deleted {{deletedCount}}/{{total}} chats, {{errorCount}} failed',
      selectAtLeastOne: 'Please select at least one chat to delete',
      chatNotFound: 'Selected chat not found',
      // Dialog: single delete
      confirmDeleteTitle: 'Delete Chat?',
      confirmDeleteDesc: 'About to delete chat',
      confirmDeleteQuestion: 'Are you sure you want to delete this chat?',
      // Dialog: bulk delete
      confirmBulkDeleteTitle: 'Delete Selected Chats?',
      confirmBulkDeleteDesc: 'About to delete the following {{count}} chats:',
      confirmBulkDeleteQuestion: 'Are you sure you want to delete these chats?',
      cancel: 'Cancel',
      delete: 'Delete',
    },
    historyItem: {
      export: 'Export',
      duplicate: 'Duplicate',
      rename: 'Rename',
      delete: 'Delete',
    },
    dateBinning: {
      today: 'Today',
      yesterday: 'Yesterday',
      past30Days: 'Past 30 Days',
    },
  },
  settings: {
    saveSuccess: 'Settings saved',
    saveFail: 'Failed to save settings',
  },
} as const;

export default en;
