const zh = {
  sidebar: {
    menu: {
      newChat: '新建对话',
      searchPlaceholder: '搜索对话...',
      searchAriaLabel: '搜索对话',
      myChats: '我的对话',
      selectAll: '全选',
      deselectAll: '取消全选',
      deleteSelected: '删除所选',
      noHistory: '暂无历史对话',
      noResults: '未找到匹配内容',
      enterSelectionMode: '进入选择模式',
      exitSelectionMode: '退出选择模式',
      guestUser: '访客用户',
      user: '用户',
      // Toast
      deleteSuccess: '对话已成功删除',
      deleteFail: '删除对话失败',
      bulkDeleteSuccess: '已成功删除 {{count}} 条对话',
      bulkDeletePartial: '已删除 {{deletedCount}}/{{total}} 条对话，{{errorCount}} 条删除失败',
      selectAtLeastOne: '请至少选择一条对话后再删除',
      chatNotFound: '未找到所选对话',
      // Dialog: single delete
      confirmDeleteTitle: '确定删除对话？',
      confirmDeleteDesc: '即将删除对话',
      confirmDeleteQuestion: '确定要删除这条对话吗？',
      // Dialog: bulk delete
      confirmBulkDeleteTitle: '确定删除所选对话？',
      confirmBulkDeleteDesc: '即将删除以下 {{count}} 条对话：',
      confirmBulkDeleteQuestion: '确定要删除这些对话吗？',
      cancel: '取消',
      delete: '删除',
    },
    historyItem: {
      export: '导出',
      duplicate: '复制',
      rename: '重命名',
      delete: '删除',
    },
    dateBinning: {
      today: '今天',
      yesterday: '昨天',
      past30Days: '过去 30 天',
    },
  },
  settings: {
    saveSuccess: '设置已保存',
    saveFail: '保存设置失败',
  },
} as const;

export default zh;
