// Device information detection utility
export function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  
  // Mobile devices
  if (/Android/.test(userAgent)) {
    const androidMatch = userAgent.match(/Android\s([0-9\.]+)/);
    const deviceMatch = userAgent.match(/;\s*([^)]+)\s*\)/);
    const version = androidMatch ? androidMatch[1] : 'Unknown';
    const device = deviceMatch ? deviceMatch[1] : 'Android Device';
    return `Android ${version} - ${device}`;
  }
  
  if (/iPhone/.test(userAgent)) {
    const iosMatch = userAgent.match(/OS\s([0-9_]+)/);
    const version = iosMatch ? iosMatch[1].replace(/_/g, '.') : 'Unknown';
    return `iPhone iOS ${version}`;
  }
  
  if (/iPad/.test(userAgent)) {
    const iosMatch = userAgent.match(/OS\s([0-9_]+)/);
    const version = iosMatch ? iosMatch[1].replace(/_/g, '.') : 'Unknown';
    return `iPad iOS ${version}`;
  }
  
  // Desktop browsers
  if (/Windows NT/.test(userAgent)) {
    const windowsMatch = userAgent.match(/Windows NT\s([0-9\.]+)/);
    const version = windowsMatch ? windowsMatch[1] : 'Unknown';
    return `Windows ${version}`;
  }
  
  if (/Mac OS X/.test(userAgent)) {
    const macMatch = userAgent.match(/Mac OS X\s([0-9_]+)/);
    const version = macMatch ? macMatch[1].replace(/_/g, '.') : 'Unknown';
    return `macOS ${version}`;
  }
  
  if (/Linux/.test(userAgent)) {
    return 'Linux';
  }
  
  // Fallback
  return 'Unknown Device';
}

export function getUserAgent(): string {
  return navigator.userAgent;
}