export const translations = {
  zh: {
    nav: {
      create: '创建笔记',
      home: '首页'
    },
    footer: {
      tagline: '端到端加密 · 零知识架构 · 阅后即焚'
    },
    home: {
      heroTitle: '发送',
      heroTitleHighlight: '阅后即焚',
      heroTitleEnd: '的加密笔记',
      heroDesc: '端到端加密，零知识架构，无追踪。你的秘密，只有收件人能看到。',
      btnCreate: '创建加密笔记',
      featuresTitle: '核心特性',
      features: [
        {
          title: '端到端加密',
          desc: '所有加密操作在浏览器本地完成，服务器永远无法读取你的内容'
        },
        {
          title: '阅后即焚',
          desc: '笔记被阅读后立即销毁，无法再次访问'
        },
        {
          title: '零知识架构',
          desc: '密钥通过 URL 片段传递，服务器从不接收密钥'
        },
        {
          title: '自动过期',
          desc: '设置过期时间，即使未被阅读也会自动销毁'
        },
        {
          title: '密码保护',
          desc: '可选添加密码，双重保护你的敏感信息'
        },
        {
          title: '文件附件',
          desc: '支持上传加密文件，一同阅后即焚'
        }
      ]
    },
    create: {
      title: '创建加密笔记',
      subtitle: '内容将在浏览器中加密，服务器无法读取',
      labelContent: '笔记内容',
      placeholderContent: '在这里输入你的秘密信息...',
      labelPassword: '密码保护（可选）',
      placeholderPassword: '设置密码后，收件人需要输入密码才能查看',
      labelExpire: '过期时间',
      labelFiles: '文件附件（可选，最多 5 个）',
      fileHint: '点击选择文件或拖放文件到这里',
      fileSizeLimit: '单个文件最大 50MB',
      btnEncrypt: '加密中...',
      btnCreate: '创建加密笔记',
      errorEmpty: '请输入笔记内容',
      errorFailed: '创建失败，请重试',
      successTitle: '笔记已创建',
      successDesc: '分享以下信息给收件人，打开后将自动销毁',
      labelFullLink: '完整链接（推荐）',
      labelNoteUrl: '笔记链接',
      labelNoteKey: '解密密钥',
      copy: '复制',
      copied: '已复制',
      copyAll: '复制完整链接',
      btnNew: '创建新笔记',
      warningSplit: '⚠️ 如果链接在分享时被截断，请分开发送：',
      footerHint: '此链接只能打开一次 · 建议通过端到端加密的渠道分享',
      passwordStrength: {
        weak: '弱',
        fair: '较弱',
        normal: '中等',
        strong: '强',
        veryStrong: '很强',
        hint: '建议：8+ 字符，包含大小写字母、数字和特殊符号'
      }
    },
    view: {
      checking: '正在检查笔记...',
      needKeyTitle: '需要解密密钥',
      needKeyDesc: '链接似乎被截断了，请输入发送者提供的解密密钥',
      placeholderKey: '粘贴解密密钥',
      btnContinue: '继续',
      keyError: '请输入解密密钥',
      keyHint: '解密密钥应该由发送者单独提供给你',
      destroyedTitle: '笔记已销毁',
      destroyedDesc: '此笔记已被阅读并永久销毁，或已过期',
      btnNew: '创建新笔记',
      errorTitle: '出错了',
      btnBack: '返回首页',
      decryptedTitle: '已解密的笔记',
      decryptedDesc: '此笔记已被永久销毁',
      labelFiles: '附件文件',
      btnDownload: '下载',
      warningDestroyed: '⚠️ 注意：此笔记已从服务器永久删除，刷新页面后将无法再次查看。如需保留，请立即复制内容。',
      passwordTitle: '需要密码',
      passwordDesc: '此笔记设置了密码保护，请输入密码查看',
      placeholderPassword: '输入密码',
      btnRead: '查看并销毁',
      btnReading: '解密中...',
      hintDestroy: '点击后笔记将从服务器永久删除',
      errorNotFound: '无法获取笔记信息',
      errorInvalidPassword: '密码错误',
      errorDecryptFailed: '解密失败：链接可能已损坏或已被阅读'
    },
    expire: {
      '1h': '1 小时',
      '24h': '24 小时',
      '3d': '3 天',
      '7d': '7 天'
    }
  },
  en: {
    nav: {
      create: 'Create Note',
      home: 'Home'
    },
    footer: {
      tagline: 'End-to-End Encrypted · Zero-Knowledge · Self-Destructing'
    },
    home: {
      heroTitle: 'Send ',
      heroTitleHighlight: 'Self-Destructing',
      heroTitleEnd: ' Encrypted Notes',
      heroDesc: 'End-to-end encrypted, zero-knowledge architecture, no tracking. Your secrets are seen only by the recipient.',
      btnCreate: 'Create Encrypted Note',
      featuresTitle: 'Core Features',
      features: [
        {
          title: 'E2E Encryption',
          desc: 'All encryption happens locally in your browser. The server never sees your content.'
        },
        {
          title: 'Self-Destructing',
          desc: 'Notes are destroyed immediately after being read and cannot be accessed again.'
        },
        {
          title: 'Zero-Knowledge',
          desc: 'Keys are passed via URL fragments; the server never receives the decryption key.'
        },
        {
          title: 'Auto-Expiration',
          desc: 'Set an expiration time after which notes are automatically destroyed even if unread.'
        },
        {
          title: 'Password Protection',
          desc: 'Optional password layer for double protection of your sensitive information.'
        },
        {
          title: 'File Attachments',
          desc: 'Support for encrypted file uploads that self-destruct along with the note.'
        }
      ]
    },
    create: {
      title: 'Create Encrypted Note',
      subtitle: 'Content is encrypted in your browser. Server cannot read it.',
      labelContent: 'Note Content',
      placeholderContent: 'Type your secret message here...',
      labelPassword: 'Password Protection (Optional)',
      placeholderPassword: 'Set a password for extra security',
      labelExpire: 'Expiration',
      labelFiles: 'File Attachments (Optional, max 5)',
      fileHint: 'Click to select or drag & drop files here',
      fileSizeLimit: 'Max 50MB per file',
      btnEncrypt: 'Encrypting...',
      btnCreate: 'Create Encrypted Note',
      errorEmpty: 'Please enter note content',
      errorFailed: 'Failed to create note, please try again',
      successTitle: 'Note Created',
      successDesc: 'Share the following info with the recipient. It will be destroyed after being opened.',
      labelFullLink: 'Full Link (Recommended)',
      labelNoteUrl: 'Note URL',
      labelNoteKey: 'Decryption Key',
      copy: 'Copy',
      copied: 'Copied',
      copyAll: 'Copy Full Link',
      btnNew: 'Create New Note',
      warningSplit: '⚠️ If the link is truncated during sharing, send these separately:',
      footerHint: 'Link can only be opened once. Share via E2E encrypted channels.',
      passwordStrength: {
        weak: 'Weak',
        fair: 'Fair',
        normal: 'Normal',
        strong: 'Strong',
        veryStrong: 'Very Strong',
        hint: 'Hint: 8+ chars, mix of case, numbers and symbols'
      }
    },
    view: {
      checking: 'Checking note...',
      needKeyTitle: 'Decryption Key Required',
      needKeyDesc: 'The link seems truncated. Please enter the decryption key provided by the sender.',
      placeholderKey: 'Paste decryption key',
      btnContinue: 'Continue',
      keyError: 'Please enter decryption key',
      keyHint: 'The decryption key should be provided to you separately by the sender.',
      destroyedTitle: 'Note Destroyed',
      destroyedDesc: 'This note has been read and permanently destroyed, or has expired.',
      btnNew: 'Create New Note',
      errorTitle: 'Something went wrong',
      btnBack: 'Back to Home',
      decryptedTitle: 'Decrypted Note',
      decryptedDesc: 'This note has been permanently destroyed',
      labelFiles: 'Attachments',
      btnDownload: 'Download',
      warningDestroyed: '⚠️ Note: This note has been permanently deleted from the server. It will not be accessible after you refresh. Copy the content now if you need to keep it.',
      passwordTitle: 'Password Required',
      passwordDesc: 'This note is password protected. Please enter the password to view.',
      placeholderPassword: 'Enter password',
      btnRead: 'View & Destroy',
      btnReading: 'Decrypting...',
      hintDestroy: 'Note will be permanently deleted from server after clicking',
      errorNotFound: 'Failed to fetch note information',
      errorInvalidPassword: 'Invalid password',
      errorDecryptFailed: 'Decryption failed: Link may be corrupted or already read'
    },
    expire: {
      '1h': '1 Hour',
      '24h': '24 Hours',
      '3d': '3 Days',
      '7d': '7 Days'
    }
  }
}
