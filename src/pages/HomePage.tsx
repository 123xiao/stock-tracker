import React, { useEffect, useState } from "react";
import { Typography, Divider, message } from "antd";
import MarketIndices from "../components/MarketIndices";
import FriendSelector from "../components/FriendSelector";
import StockHoldings from "../components/StockHoldings";
import AddFriendForm from "../components/AddFriendForm";
import EditFriendForm from "../components/EditFriendForm";
import { Friend } from "../types";
import {
  getFriends,
  saveFriends,
  deleteFriend,
  updateFriend,
} from "../utils/storage";

const { Title } = Typography;

const HomePage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [addFriendModalVisible, setAddFriendModalVisible] =
    useState<boolean>(false);
  const [editFriendModalVisible, setEditFriendModalVisible] =
    useState<boolean>(false);
  const [currentEditFriend, setCurrentEditFriend] = useState<Friend | null>(
    null
  );
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // 初始化加载朋友数据
  useEffect(() => {
    const loadedFriends = getFriends();
    setFriends(loadedFriends);

    // 如果有朋友数据，默认选中第一个
    if (loadedFriends.length > 0) {
      setSelectedFriendId(loadedFriends[0].id);
    }
  }, []);

  // 监听全局刷新事件
  useEffect(() => {
    const handleGlobalRefresh = () => {
      setLastUpdateTime(Date.now());
      message.success("数据已刷新");
    };

    window.addEventListener("app:refresh", handleGlobalRefresh);

    return () => {
      window.removeEventListener("app:refresh", handleGlobalRefresh);
    };
  }, []);

  // 处理添加朋友
  const handleAddFriend = (newFriend: Friend) => {
    const updatedFriends = [...friends, newFriend];
    setFriends(updatedFriends);
    saveFriends(updatedFriends);

    // 如果是第一个朋友，自动选中
    if (updatedFriends.length === 1) {
      setSelectedFriendId(newFriend.id);
    }
  };

  // 处理编辑朋友
  const handleEditFriendClick = (friend: Friend) => {
    setCurrentEditFriend(friend);
    setEditFriendModalVisible(true);
  };

  // 保存编辑后的朋友信息
  const handleSaveEditedFriend = (updatedFriend: Friend) => {
    // 更新本地数据
    const updatedFriends = friends.map((friend) =>
      friend.id === updatedFriend.id ? updatedFriend : friend
    );

    setFriends(updatedFriends);
    // 更新本地存储
    updateFriend(updatedFriend);

    // 刷新数据
    setLastUpdateTime(Date.now());
  };

  // 处理删除朋友
  const handleDeleteFriend = (friendId: string) => {
    // 从列表中移除
    const updatedFriends = friends.filter((friend) => friend.id !== friendId);
    setFriends(updatedFriends);

    // 从本地存储中删除
    deleteFriend(friendId);

    // 如果删除的是当前选中的朋友，则选择第一个朋友或清空选择
    if (selectedFriendId === friendId) {
      if (updatedFriends.length > 0) {
        setSelectedFriendId(updatedFriends[0].id);
      } else {
        setSelectedFriendId(null);
      }
    }
  };

  // 选择朋友
  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId(friendId);
  };

  // 获取当前选中的朋友
  const getSelectedFriend = (): Friend | null => {
    if (!selectedFriendId) return null;
    return friends.find((friend) => friend.id === selectedFriendId) || null;
  };

  return (
    <div>
      {/* <Title level={3} style={{ marginBottom: "24px" }}>
        朋友持仓
      </Title> */}

      <MarketIndices lastUpdateTime={lastUpdateTime} />

      <Divider />

      <FriendSelector
        friends={friends}
        selectedFriendId={selectedFriendId}
        onSelectFriend={handleSelectFriend}
        onAddFriend={() => setAddFriendModalVisible(true)}
        onEditFriend={handleEditFriendClick}
        onDeleteFriend={handleDeleteFriend}
      />

      <StockHoldings
        friend={getSelectedFriend()}
        lastUpdateTime={lastUpdateTime}
      />

      <AddFriendForm
        visible={addFriendModalVisible}
        onCancel={() => setAddFriendModalVisible(false)}
        onAddFriend={handleAddFriend}
      />

      <EditFriendForm
        visible={editFriendModalVisible}
        onCancel={() => {
          setEditFriendModalVisible(false);
          setCurrentEditFriend(null);
        }}
        onSave={handleSaveEditedFriend}
        friend={currentEditFriend}
      />
    </div>
  );
};

export default HomePage;
