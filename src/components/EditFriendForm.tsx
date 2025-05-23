import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  InputNumber,
  message,
  Select,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { Friend, FriendStock } from "../types";
import { stockInfos, StockInfo } from "../utils/stockInfoData";

interface EditFriendFormProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (friend: Friend) => void;
  friend: Friend | null;
}

const EditFriendForm: React.FC<EditFriendFormProps> = ({
  visible,
  onCancel,
  onSave,
  friend,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stockOptions, setStockOptions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  // 当friend变化时，重置表单数据
  useEffect(() => {
    if (visible && friend) {
      form.setFieldsValue({
        name: friend.name,
        stocks: friend.stocks,
      });
    }
  }, [visible, friend, form]);

  // 处理股票搜索
  useEffect(() => {
    if (searchText) {
      const filteredOptions = stockInfos
        .filter(
          (stock: StockInfo) =>
            stock.code.toLowerCase().includes(searchText.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchText.toLowerCase()) ||
            stock.pyname.toLowerCase().includes(searchText.toLowerCase())
        )
        .slice(0, 100) // 限制显示数量
        .map((stock: StockInfo) => ({
          value: stock.code,
          label: (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>
                {stock.name} ({stock.code})
              </span>
              <Tooltip title="在雪球查看">
                <a
                  href={`https://xueqiu.com/S/${stock.code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkOutlined />
                </a>
              </Tooltip>
            </div>
          ),
        }));
      setStockOptions(filteredOptions);
    } else {
      setStockOptions([]);
    }
  }, [searchText]);

  // 处理股票选择
  const handleStockSelect = (value: string, option: any, index: number) => {
    const selectedStock = stockInfos.find(
      (stock: StockInfo) => stock.code === value
    );
    if (selectedStock) {
      // 更新股票名称
      const stocks = form.getFieldValue("stocks");
      stocks[index].name = selectedStock.name;
      form.setFieldsValue({ stocks });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (!friend) {
        message.error("未找到要编辑的朋友信息");
        setLoading(false);
        return;
      }

      // 确保每个股票的code都转换为大写形式
      const formattedStocks = values.stocks.map((stock: any) => ({
        ...stock,
        code: stock.code.toUpperCase(),
      }));

      // 更新朋友对象，保持原有ID
      const updatedFriend: Friend = {
        ...friend,
        name: values.name,
        stocks: formattedStocks || [],
      };

      // 保存更新
      onSave(updatedFriend);

      setLoading(false);
      message.success(`已更新朋友: ${values.name}`);
      onCancel();
    } catch (error) {
      setLoading(false);
      console.error("表单验证失败:", error);
    }
  };

  return (
    <Modal
      title="编辑朋友仓位"
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
          保存
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="edit_friend_form">
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

              {fields.map(({ key, name, ...restField }, index) => (
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
                    <Select
                      showSearch
                      placeholder="股票代码/名称"
                      optionFilterProp="children"
                      onSearch={setSearchText}
                      onChange={(value, option) =>
                        handleStockSelect(value, option, index)
                      }
                      style={{ width: "180px" }}
                      options={stockOptions}
                      notFoundContent="无匹配股票"
                      filterOption={false}
                    />
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

export default EditFriendForm;
