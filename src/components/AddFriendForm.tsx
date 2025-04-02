import React, { useState } from "react";
import { Modal, Form, Input, Button, Space, InputNumber, message } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Friend, FriendStock } from "../types";
import { generateId } from "../utils/helpers";

interface AddFriendFormProps {
  visible: boolean;
  onCancel: () => void;
  onAddFriend: (friend: Friend) => void;
}

interface StockFormItem {
  code: string;
  name: string;
  quantity: number;
  cost: number;
}

const AddFriendForm: React.FC<AddFriendFormProps> = ({
  visible,
  onCancel,
  onAddFriend,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 确保每个股票的code都转换为大写形式
      const formattedStocks = values.stocks
        ? values.stocks.map((stock: any) => ({
            ...stock,
            code: stock.code.toUpperCase(),
          }))
        : [];

      // 创建新朋友对象
      const newFriend: Friend = {
        id: generateId(),
        name: values.name,
        stocks: formattedStocks,
      };

      // 添加朋友
      onAddFriend(newFriend);

      // 重置表单并关闭对话框
      form.resetFields();
      setLoading(false);
      message.success(`已添加朋友: ${values.name}`);
      onCancel();
    } catch (error) {
      setLoading(false);
      console.error("表单验证失败:", error);
    }
  };

  return (
    <Modal
      title="添加朋友"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          添加
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="add_friend_form">
        <Form.Item
          name="name"
          label="朋友名称"
          rules={[{ required: true, message: "请输入朋友名称" }]}
        >
          <Input placeholder="请输入朋友名称" />
        </Form.Item>

        <Form.List name="stocks">
          {(fields, { add, remove }) => (
            <>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontWeight: "bold" }}>持仓股票</label>
              </div>

              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "code"]}
                    rules={[{ required: true, message: "请输入股票代码" }]}
                  >
                    <Input placeholder="股票代码 (如 sh600000)" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[{ required: true, message: "请输入股票名称" }]}
                  >
                    <Input placeholder="股票名称" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "请输入持仓数量" }]}
                  >
                    <InputNumber
                      placeholder="持仓数量"
                      min={1}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    name={[name, "cost"]}
                    rules={[{ required: true, message: "请输入成本价" }]}
                  >
                    <InputNumber
                      placeholder="成本价"
                      min={0.01}
                      step={0.01}
                      precision={2}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  添加股票
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default AddFriendForm;
