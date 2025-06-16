// 生成隨機用戶名
export function generateRandomUsername(): string {
  const randomNumber = Math.floor(Math.random() * 10000);
  return `user-${randomNumber}`;
}

// 獲取用戶名（從localStorage獲取或生成新的）
export function getUsername(): string {
  let username = localStorage.getItem('username');
  if (!username) {
    username = generateRandomUsername();
    localStorage.setItem('username', username);
  }
  return username;
}

// 設定用戶名
export function setUsername(username: string): void {
  localStorage.setItem('username', username);
}

// 獲取客戶端IP地址
export async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('/api/client-info');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

// 獲取機器名稱（基於瀏覽器和平台信息）
export function getMachineName(): string {
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  
  // 嘗試從用戶代理字符串中提取有用信息
  if (userAgent.includes('Windows')) {
    return `Windows-${platform}`;
  } else if (userAgent.includes('Mac')) {
    return `Mac-${platform}`;
  } else if (userAgent.includes('Linux')) {
    return `Linux-${platform}`;
  } else if (userAgent.includes('Android')) {
    return `Android-${platform}`;
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return `iOS-${platform}`;
  }
  
  return `Device-${platform}`;
}