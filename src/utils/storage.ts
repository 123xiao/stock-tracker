import { Friend } from "../types";

const FRIENDS_STORAGE_KEY = "stock_tracker_friends";

// 保存朋友列表到本地存储
export const saveFriends = (friends: Friend[]): void => {
  localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
};

// 从本地存储获取朋友列表
export const getFriends = (): Friend[] => {
  const friendsData = localStorage.getItem(FRIENDS_STORAGE_KEY);
  if (!friendsData) {
    return [];
  }
  try {
    return JSON.parse(friendsData);
  } catch (error) {
    console.error("获取朋友数据失败:", error);
    return [];
  }
};

// 添加朋友
export const addFriend = (friend: Friend): void => {
  const friends = getFriends();
  friends.push(friend);
  saveFriends(friends);
};

// 更新朋友信息
export const updateFriend = (updatedFriend: Friend): void => {
  const friends = getFriends();
  const index = friends.findIndex((f) => f.id === updatedFriend.id);
  if (index !== -1) {
    friends[index] = updatedFriend;
    saveFriends(friends);
  }
};

// 删除朋友
export const deleteFriend = (friendId: string): void => {
  const friends = getFriends();
  const newFriends = friends.filter((f) => f.id !== friendId);
  saveFriends(newFriends);
};
