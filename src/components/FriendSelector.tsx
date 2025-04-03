import React, { useEffect } from "react";
import { Button, Space, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Friend } from "../types";

interface FriendSelectorProps {
  friends: Friend[];
  selectedFriendId: string | null;
  onSelectFriend: (friendId: string) => void;
  onAddFriend: () => void;
  onEditFriend: (friend: Friend) => void;
  onDeleteFriend: (friendId: string) => void;
}

const FriendSelector: React.FC<FriendSelectorProps> = ({
  friends,
  selectedFriendId,
  onSelectFriend,
  onAddFriend,
  onEditFriend,
  onDeleteFriend,
}) => {
  // 如果有朋友但没有选中，自动选择第一个（只在首次渲染时执行一次）
  useEffect(() => {
    // 当有朋友但没有选中任何一个时，自动选中第一个
    if (friends.length > 0 && !selectedFriendId) {
      console.log("自动选择第一个朋友");
      onSelectFriend(friends[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="friend-selector" style={{ marginBottom: "20px" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>选择朋友</h3>
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddFriend}>
            添加朋友
          </Button>
        </div>

        {friends.length === 0 ? (
          <div style={{ padding: "16px 0" }}>
            还没有添加朋友，点击"添加朋友"按钮开始添加
          </div>
        ) : (
          <div>
            <div
              className="friend-list"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="friend-item"
                  style={{
                    border: `1px solid ${
                      selectedFriendId === friend.id ? "#1890ff" : "#d9d9d9"
                    }`,
                    padding: "4px 8px",
                    borderRadius: "2px",
                    background:
                      selectedFriendId === friend.id
                        ? "#e6f7ff"
                        : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minWidth: "120px",
                  }}
                >
                  <div
                    onClick={() => onSelectFriend(friend.id)}
                    style={{ cursor: "pointer", flexGrow: 1 }}
                  >
                    {friend.name}
                  </div>
                  <div className="friend-actions">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFriend(friend);
                      }}
                      title="编辑仓位"
                    />
                    <Popconfirm
                      title="确定要删除这个朋友吗？"
                      description="删除后将无法恢复该朋友的所有仓位信息"
                      onConfirm={() => {
                        onDeleteFriend(friend.id);
                        message.success(`已删除朋友: ${friend.name}`);
                      }}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                        title="删除"
                      />
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Space>
    </div>
  );
};

export default FriendSelector;
