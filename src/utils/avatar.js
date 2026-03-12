import { computed } from 'vue';

const DEFAULT_AVATAR = '/default-avatar.png';

export function isValidAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string' || avatar.trim() === '') {
    return false;
  }
  
  if (avatar.includes('default-avatar')) {
    return false;
  }
  
  if (avatar.includes('picsum.photos')) {
    return false;
  }
  
  if (avatar.includes('via.placeholder.com')) {
    return false;
  }
  
  if (avatar.includes('neeko-copilot.bytedance.net')) {
    return false;
  }
  
  return true;
}

export function getAvatarUrl(avatar, baseURL = 'http://localhost:3000') {
  if (!isValidAvatar(avatar)) {
    console.log('========== 使用默认头像 ==========');
    console.log('avatar字段:', avatar);
    console.log('avatar无效，使用默认头像:', DEFAULT_AVATAR);
    console.log('===================================');
    return DEFAULT_AVATAR;
  }
  
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    console.log('========== 使用自定义头像 ==========');
    console.log('avatar是完整URL，直接使用:', avatar);
    console.log('===================================');
    return avatar;
  }
  
  const fullUrl = avatar.startsWith('/') ? baseURL + avatar : baseURL + '/' + avatar;
  const timestamp = Date.now();
  const urlWithTimestamp = fullUrl + '?t=' + timestamp;
  
  console.log('========== 使用自定义头像 ==========');
  console.log('原始avatar路径:', avatar);
  console.log('拼接后的完整URL:', fullUrl);
  console.log('添加时间戳后的URL:', urlWithTimestamp);
  console.log('===================================');
  
  return urlWithTimestamp;
}

export function useAvatar(avatarGetter, baseURL = 'http://localhost:3000') {
  return computed(() => getAvatarUrl(avatarGetter.value, baseURL));
}

export function handleAvatarError(event) {
  if (event.target.src !== DEFAULT_AVATAR) {
    event.target.src = DEFAULT_AVATAR;
  }
}

export function handleAvatarLoad(avatarUrl) {
  console.log('头像加载成功，URL:', avatarUrl);
}

export { DEFAULT_AVATAR };
